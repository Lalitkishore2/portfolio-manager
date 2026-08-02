import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const portfolioDir = path.resolve(process.cwd(), "../PORTFOLIO");
    const managerDir = process.cwd();

    // 1. Fetch real Git commits from repository
    let commits: Array<{ hash: string; message: string; relativeTime: string; date: string }> = [];
    try {
      const { stdout } = await execAsync('git log -n 5 --pretty=format:"%h|%s|%cr|%cd"', { cwd: managerDir });
      commits = stdout.split("\n").filter(Boolean).map((line) => {
        const [hash, message, relativeTime, date] = line.split("|");
        return { hash, message, relativeTime, date };
      });
    } catch (e) {
      console.error("Git log failed, falling back to static commit reading", e);
    }

    // 2. Compute dynamic category breakdown from projects.json
    const projectsPath = path.join(portfolioDir, "content/projects.json");
    let categoryStats: Array<{ name: string; value: number; count: number }> = [];
    if (fs.existsSync(projectsPath)) {
      const raw = fs.readFileSync(projectsPath, "utf-8");
      const projects = JSON.parse(raw);
      const categoryMap: Record<string, number> = {};
      let total = 0;
      projects.forEach((p: any) => {
        const cat = p.category ? p.category.toUpperCase() : "OTHER";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        total++;
      });
      categoryStats = Object.entries(categoryMap).map(([name, count]) => ({
        name,
        count,
        value: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
    }

    // 3. Compute query stats from queries.json
    const queriesPath = path.join(portfolioDir, "content/queries.json");
    let unresolvedQueries = 0;
    let resolvedQueries = 0;
    if (fs.existsSync(queriesPath)) {
      const raw = fs.readFileSync(queriesPath, "utf-8");
      const queries = JSON.parse(raw);
      unresolvedQueries = queries.filter((q: any) => q.status === "unreviewed").length;
      resolvedQueries = queries.filter((q: any) => q.status === "resolved").length;
    }

    // 4. Generate dynamic traffic trend
    let trafficData: Array<{ day: string; views: number }> = [];
    let trafficSource = "MOCK";

    // A. Try GA4 API first
    if (process.env.GA_PROPERTY_ID && process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
      try {
        const { BetaAnalyticsDataClient } = require('@google-analytics/data');
        const analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: {
            client_email: process.env.GA_CLIENT_EMAIL,
            private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
          },
        });

        const [response] = await analyticsDataClient.runReport({
          property: `properties/${process.env.GA_PROPERTY_ID}`,
          dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'screenPageViews' }],
        });

        // Mark as GA4 connected regardless – even 0 rows means API is live
        trafficSource = "GA4";

        if (response.rows && response.rows.length > 0) {
          // Sort rows by date ascending
          const sortedRows = response.rows.sort((a: any, b: any) => {
            return a.dimensionValues[0].value.localeCompare(b.dimensionValues[0].value);
          });
          
          // Show last 30 days
          const last30 = sortedRows.slice(-30);
          trafficData = last30.map((row: any) => {
            const rawDate = row.dimensionValues[0].value; // "YYYYMMDD"
            const y = rawDate.slice(0, 4);
            const m = rawDate.slice(4, 6);
            const d = rawDate.slice(6, 8);
            const dateObj = new Date(`${y}-${m}-${d}T12:00:00Z`);
            return {
              day: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              views: parseInt(row.metricValues[0].value || '0', 10)
            };
          });
        } else {
          // GA4 connected but no data yet — show a minimal placeholder with GA4 label
          const now = new Date();
          trafficData = Array.from({ length: 14 }, (_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - (13 - i));
            return {
              day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              views: 0
            };
          });
        }
      } catch (gaError) {
        console.error("GA4 Fetch Error:", gaError);
      }
    }

    // B. Fallback to GitHub Traffic API
    if (trafficData.length === 0) {
      try {
        const token = process.env.CMS_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO;
        if (token && repo) {
          const res = await fetch(`https://api.github.com/repos/${repo}/traffic/views`, {
            headers: {
              "Accept": "application/vnd.github.v3+json",
              "Authorization": `token ${token}`
            },
            next: { revalidate: 3600 }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.views && data.views.length > 0) {
              trafficSource = "GITHUB";
              trafficData = data.views.map((v: any) => ({
                day: new Date(v.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                views: v.count
              }));
            }
          }
        }
      } catch (e) {
        console.error("Error fetching GitHub traffic", e);
      }
    }

    // Fallback if GitHub API fails or returns no data
    if (trafficData.length === 0) {
      const now = new Date();
      const baseViews = 1200; // Starting baseline
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const progress = (29 - i) / 29;
        const trend = baseViews * (1 + 0.18 * progress);
        const randomFactor = 1 + (Math.random() * 0.16 - 0.08);
        trafficData.push({ day: dayLabel, views: Math.floor(trend * randomFactor) });
      }
    }

    return NextResponse.json({
      ok: true,
      commits,
      categoryStats,
      unresolvedQueries,
      resolvedQueries,
      totalQueries: unresolvedQueries + resolvedQueries,
      coverageRate: (unresolvedQueries + resolvedQueries) > 0 ? Math.round((resolvedQueries / (unresolvedQueries + resolvedQueries)) * 100) : 100,
      trafficData,
      trafficSource,
      lastSync: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
