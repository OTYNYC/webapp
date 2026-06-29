import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hasBlobStorage, loadSiteContent, normalizeEditableContent, saveSiteContent, serializeJson } from "./siteContent";
import type { EditableContent } from "./siteContent";

export async function getEditableContent(): Promise<EditableContent> {
  return loadSiteContent();
}

export function getSaveTarget() {
  if (hasBlobStorage()) return "vercel-blob";
  if (process.env.NODE_ENV !== "production") return "local-dev";

  return "unconfigured";
}

export function validateEditableContent(input: unknown): EditableContent {
  return normalizeEditableContent(input);
}

export async function saveEditableContent(content: EditableContent) {
  if (hasBlobStorage()) {
    await saveSiteContent(content);

    return { mode: "vercel-blob", files: ["content/site-content.json"] };
  }

  if (process.env.NODE_ENV !== "production") {
    const files = [
      { path: "content/featured-events.json", data: content.featuredEvents },
      { path: "content/calendar-events.json", data: content.calendarEvents },
      { path: "content/moments.json", data: content.moments },
    ];

    await Promise.all(files.map((file) => writeFile(join(process.cwd(), file.path), serializeJson(file.data), "utf8")));

    return { mode: "local-dev", files: files.map((file) => file.path) };
  }

  throw new Error("Vercel Blob storage is not configured for this deployment.");
}
