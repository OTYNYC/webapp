import type { CalendarEventDetail } from "./googleCalendar";

// Calendar organizers tag events by starting the title with one of these labels
// (e.g. "LR: Bible Study", "Fellowship - Movie Night"). This is the single source of
// truth for recognizing that prefix, matching on it for filtering/color-coding, and
// stripping it back out before the title is shown anywhere.
const FEATURED_PREFIXES = ["LR", "Fellowship", "Service"] as const;

export type FeaturedPrefix = (typeof FEATURED_PREFIXES)[number];

// Feast/fast events follow the same "LABEL: Title" convention (e.g. "Feast: Timkat"),
// so it gets the same prefix-matching/stripping treatment as FEATURED_PREFIXES above.
const FEAST_FAST_PREFIXES = ["Feast", "Fast"] as const;

function prefixPattern(prefix: string): RegExp {
  return new RegExp(`^${prefix}(?=[\\s:-]|$)`, "i");
}

function matchPrefix<T extends string>(title: string, prefixes: readonly T[]): T | null {
  const trimmed = title.trim();

  return prefixes.find((prefix) => prefixPattern(prefix).test(trimmed)) ?? null;
}

function stripPrefix(title: string, prefixes: readonly string[]): string {
  const trimmed = title.trim();
  const prefix = matchPrefix(trimmed, prefixes);
  if (!prefix) return trimmed;

  const rest = trimmed.slice(prefix.length).replace(/^[\s:-]+/, "").trim();

  return rest || prefix;
}

export function getFeaturedPrefix(title: string): FeaturedPrefix | null {
  return matchPrefix(title, FEATURED_PREFIXES);
}

export function isFeaturedEvent(title: string): boolean {
  return getFeaturedPrefix(title) !== null;
}

export function stripFeaturedPrefix(title: string): string {
  return stripPrefix(title, FEATURED_PREFIXES);
}

export function stripFeastFastPrefix(title: string): string {
  return stripPrefix(title, FEAST_FAST_PREFIXES);
}

export function formatEventTime(event: CalendarEventDetail): string {
  if (event.allDay) return "All day";

  const start = new Date(event.start);
  const end = new Date(event.end);
  const startText = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endText = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return `${startText} - ${endText}`;
}

export function formatEventDateTime(event: CalendarEventDetail): string {
  const start = new Date(event.start);
  const dateText = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return `${dateText} · ${formatEventTime(event)}`;
}

export function formatEventDateRange(event: CalendarEventDetail): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const sameDay = start.toDateString() === end.toDateString();
  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return sameDay ? endText : `${startText}-${endText}`;
}

const URL_PATTERN = /https?:\/\/\S+/i;
const TRAILING_PUNCTUATION_PATTERN = /[.,;:!?)\]]+$/;
const ANCHOR_PATTERN = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>[\s\S]*?<\/a>/i;
const BREAK_PATTERN = /<br\s*\/?>/gi;
const BLOCK_CLOSE_PATTERN = /<\/(?:p|div|li)\s*>/gi;
const BLOCK_OPEN_PATTERN = /<(?:p|div|li|ul|ol)\b[^>]*>/gi;
const ANY_TAG_PATTERN = /<[^>]+>/g;

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:nbsp|amp|lt|gt|quot|#39|apos);/g, (entity) => HTML_ENTITIES[entity] ?? entity);
}

// Google Calendar descriptions can come back as HTML (rich-text events use <br>, <a href>, etc).
// We never render this as HTML (that would open an XSS hole via calendar-editor access) - instead
// we manually interpret the handful of tags we care about and strip everything else as plain text.
export function parseEventDescription(description: string): { text: string; url: string | null } {
  let url: string | null = null;
  let working = description;

  const anchorMatch = working.match(ANCHOR_PATTERN);
  if (anchorMatch && anchorMatch.index !== undefined) {
    url = anchorMatch[1] ?? anchorMatch[2] ?? null;
    working = working.slice(0, anchorMatch.index) + working.slice(anchorMatch.index + anchorMatch[0].length);
  }

  working = decodeHtmlEntities(
    working.replace(BREAK_PATTERN, "\n").replace(BLOCK_CLOSE_PATTERN, "\n").replace(BLOCK_OPEN_PATTERN, "").replace(ANY_TAG_PATTERN, ""),
  );

  if (!url) {
    const bareUrlMatch = working.match(URL_PATTERN);
    if (bareUrlMatch && bareUrlMatch.index !== undefined) {
      url = bareUrlMatch[0].replace(TRAILING_PUNCTUATION_PATTERN, "");
      working = working.slice(0, bareUrlMatch.index) + working.slice(bareUrlMatch.index + bareUrlMatch[0].length);
    }
  }

  const text = working
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[ \t]+|[ \t]+$/gm, "")
    .trim();

  return { text, url };
}
