import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { calendarEvents, featuredEvents, moments, type CalendarEvent, type FeaturedEvent, type Moment } from "../data";

export interface EditableContent {
  featuredEvents: FeaturedEvent[];
  calendarEvents: CalendarEvent[];
  moments: Moment[];
}

interface ContentFile {
  path: string;
  data: unknown;
}

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

export function getEditableContent(): EditableContent {
  return {
    featuredEvents,
    calendarEvents,
    moments,
  };
}

export function getSaveTarget() {
  if (getGithubConfig()) return "github";
  if (process.env.NODE_ENV !== "production") return "local-dev";

  return "unconfigured";
}

export function validateEditableContent(input: unknown): EditableContent {
  const record = requireRecord(input, "content");

  return {
    featuredEvents: validateFeaturedEvents(record.featuredEvents),
    calendarEvents: validateCalendarEvents(record.calendarEvents),
    moments: validateMoments(record.moments),
  };
}

export async function saveEditableContent(content: EditableContent) {
  const files: ContentFile[] = [
    { path: "content/featured-events.json", data: content.featuredEvents },
    { path: "content/calendar-events.json", data: content.calendarEvents },
    { path: "content/moments.json", data: content.moments },
  ];
  const githubConfig = getGithubConfig();

  if (githubConfig) {
    await saveFilesToGithub(files, githubConfig);

    return { mode: "github", files: files.map((file) => file.path) };
  }

  if (process.env.NODE_ENV !== "production") {
    await Promise.all(files.map((file) => writeFile(join(process.cwd(), file.path), serializeJson(file.data), "utf8")));

    return { mode: "local-dev", files: files.map((file) => file.path) };
  }

  throw new Error("GitHub content saving is not configured for this deployment.");
}

function validateFeaturedEvents(input: unknown): FeaturedEvent[] {
  return requireArray(input, "featuredEvents").map((event, index) => {
    const record = requireRecord(event, `featuredEvents[${index}]`);

    return {
      id: requireText(record.id, `featuredEvents[${index}].id`),
      label: requireText(record.label, `featuredEvents[${index}].label`),
      title: requireText(record.title, `featuredEvents[${index}].title`),
      date: requireDate(record.date, `featuredEvents[${index}].date`),
      time: optionalText(record.time),
      location: optionalText(record.location),
      summary: requireText(record.summary, `featuredEvents[${index}].summary`),
      image: requireImagePath(record.image, `featuredEvents[${index}].image`),
      alt: requireText(record.alt, `featuredEvents[${index}].alt`),
      published: Boolean(record.published),
    };
  });
}

function validateCalendarEvents(input: unknown): CalendarEvent[] {
  return requireArray(input, "calendarEvents").map((event, index) => {
    const record = requireRecord(event, `calendarEvents[${index}]`);

    return {
      id: requireText(record.id, `calendarEvents[${index}].id`),
      title: requireText(record.title, `calendarEvents[${index}].title`),
      start: requireDate(record.start, `calendarEvents[${index}].start`),
      end: requireDate(record.end, `calendarEvents[${index}].end`),
    };
  });
}

function validateMoments(input: unknown): Moment[] {
  return requireArray(input, "moments").map((moment, index) => {
    const record = requireRecord(moment, `moments[${index}]`);

    return {
      id: requireText(record.id, `moments[${index}].id`),
      label: requireText(record.label, `moments[${index}].label`),
      title: requireText(record.title, `moments[${index}].title`),
      image: requireImagePath(record.image, `moments[${index}].image`),
      alt: requireText(record.alt, `moments[${index}].alt`),
      details: requireText(record.details, `moments[${index}].details`),
      published: Boolean(record.published),
    };
  });
}

function requireArray(input: unknown, label: string) {
  if (!Array.isArray(input)) throw new Error(`${label} must be an array.`);

  return input;
}

function requireRecord(input: unknown, label: string): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`${label} must be an object.`);

  return input as Record<string, unknown>;
}

function requireText(input: unknown, label: string) {
  if (typeof input !== "string" || input.trim().length === 0) throw new Error(`${label} is required.`);

  return input.trim();
}

function optionalText(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function requireDate(input: unknown, label: string) {
  const value = requireText(input, label);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} must use YYYY-MM-DD format.`);

  return value;
}

function requireImagePath(input: unknown, label: string) {
  const value = requireText(input, label);

  if (!value.startsWith("/") && !value.startsWith("https://") && !value.startsWith("http://")) {
    throw new Error(`${label} must be a site path or URL.`);
  }

  return value;
}

function serializeJson(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

function getGithubConfig() {
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

async function saveFilesToGithub(files: ContentFile[], config: NonNullable<ReturnType<typeof getGithubConfig>>) {
  const ref = await githubRequest<GithubReference>(config, `git/ref/heads/${config.branch}`);
  const baseCommit = await githubRequest<GithubCommit>(config, `git/commits/${ref.object.sha}`);
  const tree = await githubRequest<GithubTree>(config, "git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: files.map((file) => ({
        content: serializeJson(file.data),
        mode: "100644",
        path: file.path,
        type: "blob",
      })),
    }),
  });
  const commit = await githubRequest<GithubCommit>(config, "git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: "Update site content from admin",
      parents: [ref.object.sha],
      tree: tree.sha,
    }),
  });

  await githubRequest(config, `git/refs/heads/${config.branch}`, {
    method: "PATCH",
    body: JSON.stringify({ force: false, sha: commit.sha }),
  });
}

async function githubRequest<T = unknown>(
  config: NonNullable<ReturnType<typeof getGithubConfig>>,
  path: string,
  init: RequestInit = {},
) {
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
