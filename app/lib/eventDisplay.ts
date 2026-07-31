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

export type FeastFastPrefix = (typeof FEAST_FAST_PREFIXES)[number];

// The calendar belongs to a NYC organization, so every date/time is rendered in that
// zone regardless of where the code runs. Without this the server (UTC on Vercel) and
// the browser format the same instant differently, which both misreports event times
// and produces a hydration mismatch.
export const CALENDAR_TIME_ZONE = "America/New_York";

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

export function getFeastFastPrefix(title: string): FeastFastPrefix | null {
  return matchPrefix(title, FEAST_FAST_PREFIXES);
}

export function stripFeastFastPrefix(title: string): string {
  return stripPrefix(title, FEAST_FAST_PREFIXES);
}

// All-day events carry a floating date ("2026-07-31") that normalizeEvent anchors to UTC
// midnight, so reading one back in a western zone lands on the previous day. Timed events
// are true instants and belong in the calendar zone.
function eventTimeZone(event: CalendarEventDetail): string {
  return event.allDay ? "UTC" : CALENDAR_TIME_ZONE;
}

// "YYYY-MM-DD" for the instant as it falls in the given zone - used to compare two
// instants for "same calendar day" without going through the runtime's local zone.
export function calendarDayKey(date: Date, timeZone: string = CALENDAR_TIME_ZONE): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

export function eventDayKey(event: CalendarEventDetail, boundary: "start" | "end"): string {
  return calendarDayKey(new Date(event[boundary]), eventTimeZone(event));
}

export function formatEventTime(event: CalendarEventDetail): string {
  if (event.allDay) return "All day";

  const start = new Date(event.start);
  const end = new Date(event.end);
  const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", timeZone: CALENDAR_TIME_ZONE };
  const startText = start.toLocaleTimeString("en-US", options);
  const endText = end.toLocaleTimeString("en-US", options);

  return `${startText} - ${endText}`;
}

export function formatEventDateTime(event: CalendarEventDetail): string {
  const start = new Date(event.start);
  const dateText = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: eventTimeZone(event),
  });

  return `${dateText} · ${formatEventTime(event)}`;
}

export function formatEventDateRange(event: CalendarEventDetail): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const timeZone = eventTimeZone(event);
  const sameDay = eventDayKey(event, "start") === eventDayKey(event, "end");
  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone });
  const endText = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone });

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

// A calendar editor controls the description HTML, so an anchor could carry a
// `javascript:` or `data:` href. React does not block those, and consumers drop this
// value straight into an href, so anything but http(s) is discarded.
function toSafeUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const parsed = new URL(value, "https://example.invalid");

    return parsed.protocol === "http:" || parsed.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

// Google Calendar descriptions can come back as HTML (rich-text events use <br>, <a href>, etc).
// We never render this as HTML (that would open an XSS hole via calendar-editor access) - instead
// we manually interpret the handful of tags we care about and strip everything else as plain text.
export function parseEventDescription(description: string): { text: string; url: string | null } {
  let url: string | null = null;
  let working = description;

  const anchorMatch = working.match(ANCHOR_PATTERN);
  if (anchorMatch && anchorMatch.index !== undefined) {
    url = toSafeUrl(anchorMatch[1] ?? anchorMatch[2] ?? null);
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
