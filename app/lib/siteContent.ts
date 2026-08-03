import { get, put } from "@vercel/blob";
import {
  calendarEvents,
  featuredEvents,
  galleryPhotos,
  moments,
  type CalendarEvent,
  type FeaturedEvent,
  type GalleryPhoto,
  type Moment,
} from "../data";

export interface EditableContent {
  featuredEvents: FeaturedEvent[];
  calendarEvents: CalendarEvent[];
  moments: Moment[];
  galleryPhotos: GalleryPhoto[];
}

export const SITE_CONTENT_BLOB_PATH = "content/site-content.json";

// Early gallery entries used an uppercase extension for a handful of lowercase local
// files. macOS resolves those paths, but Linux deployments do not. Keep these aliases on
// the read path as well as fixing the fallback JSON so existing Blob content self-heals.
const GALLERY_PATH_ALIASES: Record<string, string> = {
  "/assets/gallery/abba_ephrem.JPG": "/assets/gallery/abba_ephrem.jpg",
  "/assets/gallery/abune_petros.JPG": "/assets/gallery/abune_petros.jpg",
  "/assets/gallery/lenten_liturgy.JPG": "/assets/gallery/lenten_liturgy.jpg",
  "/assets/gallery/meskel.JPG": "/assets/gallery/meskel.jpg",
  "/assets/gallery/social_deacon_christian.JPG": "/assets/gallery/social_deacon_christian.jpg",
};

export function getFallbackSiteContent(): EditableContent {
  return {
    calendarEvents,
    featuredEvents,
    moments,
    galleryPhotos,
  };
}

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function loadSiteContent(): Promise<EditableContent> {
  if (!hasBlobStorage()) return getFallbackSiteContent();

  try {
    const result = await get(SITE_CONTENT_BLOB_PATH, { access: "public" });
    if (!result?.stream) return getFallbackSiteContent();

    const content = await streamToText(result.stream);

    return normalizeEditableContent(JSON.parse(content));
  } catch {
    return getFallbackSiteContent();
  }
}

export async function saveSiteContent(content: EditableContent) {
  if (!hasBlobStorage()) {
    throw new Error("Vercel Blob storage is not configured for this deployment.");
  }

  await put(SITE_CONTENT_BLOB_PATH, serializeJson(content), {
    access: "public",
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json",
  });
}

export function normalizeEditableContent(input: unknown): EditableContent {
  const record = requireRecord(input, "content");

  return {
    featuredEvents: validateFeaturedEvents(record.featuredEvents),
    calendarEvents: validateCalendarEvents(record.calendarEvents),
    moments: validateMoments(record.moments),
    galleryPhotos:
      record.galleryPhotos === undefined
        ? galleryPhotos
        : validateGalleryPhotos(record.galleryPhotos),
  };
}

// Ids are admin-editable but are used as React keys and as lookup handles, so duplicates
// must not reach storage. This is deliberately separate from normalizeEditableContent:
// that runs on the public read path too, where loadSiteContent swallows any throw and
// serves fallback content, so a strict check there would blank the site instead of
// reporting the problem. Enforce it only where an admin can see and fix the error.
export function assertUniqueContentIds(content: EditableContent) {
  requireUniqueIds(content.featuredEvents, "featuredEvents");
  requireUniqueIds(content.calendarEvents, "calendarEvents");
  requireUniqueIds(content.moments, "moments");
  requireUniqueIds(content.galleryPhotos, "galleryPhotos");
}

function requireUniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>();

  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`${label} contains a duplicate id: ${item.id}.`);
    seen.add(item.id);
  }
}

export function serializeJson(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`;
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

function validateGalleryPhotos(input: unknown): GalleryPhoto[] {
  return requireArray(input, "galleryPhotos").map((photo, index) => {
    const record = requireRecord(photo, `galleryPhotos[${index}]`);

    return {
      id: requireText(record.id, `galleryPhotos[${index}].id`),
      src: normalizeGalleryPath(requireImagePath(record.src, `galleryPhotos[${index}].src`)),
      alt: requireText(record.alt, `galleryPhotos[${index}].alt`),
    };
  });
}

function normalizeGalleryPath(path: string) {
  return GALLERY_PATH_ALIASES[path] ?? path;
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

async function streamToText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result + decoder.decode();
}
