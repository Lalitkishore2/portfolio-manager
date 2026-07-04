/**
 * GitHub Content Service
 *
 * Replaces all filesystem operations with GitHub REST API calls.
 * This allows the admin CMS to work from any deployment (Vercel, local, etc.)
 * without needing local filesystem access to the repo.
 */

const GITHUB_API = "https://api.github.com";

function getConfig() {
  return {
    repo: process.env.GITHUB_REPO || "Lalitkishore2/portfolio",
    token: process.env.GITHUB_TOKEN || "",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

function headers() {
  const { token } = getConfig();
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/* ------------------------------------------------------------------ */
/*  Low-level helpers                                                  */
/* ------------------------------------------------------------------ */

/** Get a single file from the repo. Returns { content, sha, encoding }. */
export async function getFile(
  filePath: string
): Promise<{ content: string; sha: string }> {
  const { repo, branch } = getConfig();
  const url = `${GITHUB_API}/repos/${repo}/contents/${filePath}?ref=${branch}`;

  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `GitHub API error ${res.status} for ${filePath}: ${body}`
    );
  }

  const data = await res.json();
  // GitHub returns content as base64
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: decoded, sha: data.sha };
}

/** Create or update a single file in the repo. */
export async function updateFile(
  filePath: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ sha: string; commitSha: string }> {
  const { repo, branch } = getConfig();
  const url = `${GITHUB_API}/repos/${repo}/contents/${filePath}`;

  // If no sha provided, try to get the current one (for updates)
  let currentSha = sha;
  if (!currentSha) {
    try {
      const existing = await getFile(filePath);
      currentSha = existing.sha;
    } catch {
      // File doesn't exist yet — that's fine for creation
    }
  }

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch,
  };
  if (currentSha) {
    body.sha = currentSha;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `GitHub API PUT error ${res.status} for ${filePath}: ${errBody}`
    );
  }

  const data = await res.json();
  return {
    sha: data.content.sha,
    commitSha: data.commit.sha,
  };
}

/* ------------------------------------------------------------------ */
/*  High-level JSON helpers                                            */
/* ------------------------------------------------------------------ */

/** Read a content/*.json file and return parsed JSON + SHA. */
export async function getContentJSON<T = unknown>(
  filename: string
): Promise<{ data: T; sha: string }> {
  const { content, sha } = await getFile(`content/${filename}`);
  return { data: JSON.parse(content) as T, sha };
}

/** Write a content/*.json file back to the repo with a commit message. */
export async function saveContentJSON(
  filename: string,
  data: unknown,
  commitMessage?: string
): Promise<{ sha: string; commitSha: string }> {
  const message =
    commitMessage || `cms: update content/${filename}`;
  const content = JSON.stringify(data, null, 2) + "\n";
  return updateFile(`content/${filename}`, content, message);
}

/* ------------------------------------------------------------------ */
/*  Publish / Trigger rebuild                                          */
/* ------------------------------------------------------------------ */

/**
 * Trigger a GitHub Pages rebuild by dispatching the deploy workflow
 * or creating an empty commit. Since every save already commits,
 * this is mainly useful for forcing a redeploy without content changes.
 */
export async function triggerRebuild(): Promise<string> {
  const { repo } = getConfig();

  // Try workflow dispatch first
  try {
    const url = `${GITHUB_API}/repos/${repo}/actions/workflows/deploy.yml/dispatches`;
    const res = await fetch(url, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ ref: getConfig().branch }),
    });
    if (res.ok || res.status === 204) {
      return "Triggered GitHub Actions rebuild successfully.";
    }
  } catch {
    // Fall through to empty commit method
  }

  // Fallback: create an empty commit via the Git API
  const { repo: repoName, branch } = getConfig();

  // Get the latest commit SHA
  const refRes = await fetch(
    `${GITHUB_API}/repos/${repoName}/git/ref/heads/${branch}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!refRes.ok) throw new Error("Failed to get branch ref");
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // Get the tree SHA from the latest commit
  const commitRes = await fetch(
    `${GITHUB_API}/repos/${repoName}/git/commits/${latestCommitSha}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!commitRes.ok) throw new Error("Failed to get commit data");
  const commitData = await commitRes.json();
  const treeSha = commitData.tree.sha;

  // Create a new commit with the same tree (empty commit)
  const newCommitRes = await fetch(
    `${GITHUB_API}/repos/${repoName}/git/commits`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        message: "cms: trigger rebuild",
        tree: treeSha,
        parents: [latestCommitSha],
      }),
    }
  );
  if (!newCommitRes.ok) throw new Error("Failed to create empty commit");
  const newCommitData = await newCommitRes.json();

  // Update the branch ref
  const updateRefRes = await fetch(
    `${GITHUB_API}/repos/${repoName}/git/ref/heads/${branch}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ sha: newCommitData.sha }),
    }
  );
  if (!updateRefRes.ok) throw new Error("Failed to update branch ref");

  return "Created empty commit to trigger rebuild.";
}

/* ------------------------------------------------------------------ */
/*  Connection test                                                    */
/* ------------------------------------------------------------------ */

/** Verify that the GitHub token has access to the configured repo. */
export async function testConnection(): Promise<{
  ok: boolean;
  repoName: string;
  message: string;
}> {
  const { repo } = getConfig();
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repo}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) {
      return {
        ok: false,
        repoName: repo,
        message: `GitHub returned ${res.status}: ${res.statusText}`,
      };
    }
    const data = await res.json();
    return {
      ok: true,
      repoName: data.full_name,
      message: `Connected to ${data.full_name} (${data.visibility})`,
    };
  } catch (err: any) {
    return {
      ok: false,
      repoName: repo,
      message: err.message || "Failed to connect",
    };
  }
}
