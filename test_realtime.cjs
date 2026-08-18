const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const match = envText.match(/GA_PRIVATE_KEY="([\s\S]*?)"/);
const rawKey = match ? match[1] : '';

const formattedKey = rawKey
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/\\n/g, '\n')
  .replace(/\r\n/g, '\n');

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: "analytics-api-reader@lalitkishore-portfolio.iam.gserviceaccount.com",
    private_key: formattedKey,
  },
});

async function checkBoth() {
  console.log("Checking runReport...");
  try {
    const [report] = await analyticsDataClient.runReport({
      property: `properties/507163958`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'eventCount' }],
    });
    console.log("runReport rows count:", report.rows ? report.rows.length : 0);
    if (report.rows) {
      console.log(JSON.stringify(report.rows, null, 2));
    }
  } catch (e) {
    console.error("runReport error:", e.message);
  }

  console.log("\nChecking runRealtimeReport...");
  try {
    const [realtime] = await analyticsDataClient.runRealtimeReport({
      property: `properties/507163958`,
      metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
    });
    console.log("runRealtimeReport rows count:", realtime.rows ? realtime.rows.length : 0);
    if (realtime.rows) {
      console.log(JSON.stringify(realtime.rows, null, 2));
    }
  } catch (e) {
    console.error("runRealtimeReport error:", e.message);
  }
}

checkBoth();
