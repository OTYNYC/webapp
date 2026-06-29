interface GithubReference {
  object: {
    sha: string;
  };
}

interface GithubCommit {
  sha: string;
  tree: {
    sha: string;
  };
}

interface GithubTree {
  sha: string;
}

interface GithubBlob {
  sha: string;
}

export interface GithubFileChange {
  content: string;
  encoding?: "base64" | "utf-8";
  path: string;
}

export interface GithubContentConfig {
  branch: string;
  repo: string;
  token: string;
}

export function getGithubConfig(): GithubContentConfig | null {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  const repo =
    process.env.GITHUB_CONTENT_REPO ||
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");

  if (!token || !repo) return null;

  return {
    branch: process.env.GITHUB_CONTENT_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",
    repo,
    token,
  };
}

export async function saveFilesToGithub(files: GithubFileChange[], config: GithubContentConfig, message: string) {
  const ref = await githubRequest<GithubReference>(config, `git/ref/heads/${config.branch}`);
  const baseCommit = await githubRequest<GithubCommit>(config, `git/commits/${ref.object.sha}`);
  const treeItems = await Promise.all(
    files.map(async (file) => {
      if (file.encoding === "base64") {
        const blob = await githubRequest<GithubBlob>(config, "git/blobs", {
          method: "POST",
          body: JSON.stringify({
            content: file.content,
            encoding: "base64",
          }),
        });

        return {
          mode: "100644",
          path: file.path,
          sha: blob.sha,
          type: "blob",
        };
      }

      return {
        content: file.content,
        mode: "100644",
        path: file.path,
        type: "blob",
      };
    }),
  );
  const tree = await githubRequest<GithubTree>(config, "git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    }),
  });
  const commit = await githubRequest<GithubCommit>(config, "git/commits", {
    method: "POST",
    body: JSON.stringify({
      message,
      parents: [ref.object.sha],
      tree: tree.sha,
    }),
  });

  await githubRequest(config, `git/refs/heads/${config.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ force: false, sha: commit.sha }),
  });
}

async function githubRequest<T = unknown>(config: GithubContentConfig, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com/repos/${config.repo}/${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "User-Agent": "oty-nyc-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();

    throw new Error(`GitHub request failed (${response.status}): ${details.slice(0, 240)}`);
  }

  return (await response.json()) as T;
}
