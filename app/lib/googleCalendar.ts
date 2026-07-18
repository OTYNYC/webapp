import { getMonthGridDays } from "./monthGrid";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3/calendars";

export interface CalendarAttachment {
  title: string;
  mimeType: string;
  fileUrl: string;
  iconLink: string;
  imageSrc: string | null;
}

export interface CalendarEventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  htmlLink: string;
  start: string;
  end: string;
  allDay: boolean;
  attachments: CalendarAttachment[];
}

export interface MonthEventsResult {
  events: CalendarEventDetail[];
  error: string | null;
}

interface RawGoogleAttachment {
  title?: string;
  mimeType?: string;
  fileUrl?: string;
  iconLink?: string;
  fileId?: string;
}

interface RawGoogleEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  attachments?: RawGoogleAttachment[];
}

interface RawGoogleEventsResponse {
  items?: RawGoogleEvent[];
  error?: { message?: string };
}

export function hasGoogleCalendarConfig() {
  return Boolean(process.env.GOOGLE_CALENDAR_API_KEY && process.env.GOOGLE_CALENDAR_ID);
}

export async function fetchMonthEvents(year: number, month: number): Promise<MonthEventsResult> {
  if (!hasGoogleCalendarConfig()) {
    return { events: [], error: "not-configured" };
  }

  const gridDays = getMonthGridDays(year, month);
  const timeMin = gridDays[0];
  const timeMax = new Date(gridDays[gridDays.length - 1]);
  timeMax.setDate(timeMax.getDate() + 1);

  const calendarId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID as string);
  const params = new URLSearchParams({
    key: process.env.GOOGLE_CALENDAR_API_KEY as string,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    fields: "items(id,summary,description,location,htmlLink,start,end,attachments)",
  });

  try {
    const response = await fetch(`${CALENDAR_API_BASE}/${calendarId}/events?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    const data = (await response.json()) as RawGoogleEventsResponse;

    if (!response.ok) {
      return { events: [], error: data.error?.message ?? "Failed to load calendar events." };
    }

    return { events: (data.items ?? []).map(normalizeEvent), error: null };
  } catch {
    return { events: [], error: "Failed to reach Google Calendar." };
  }
}

function normalizeEvent(raw: RawGoogleEvent): CalendarEventDetail {
  const allDay = Boolean(raw.start?.date);
  const start = new Date(raw.start?.dateTime ?? raw.start?.date ?? Date.now());
  const rawEnd = new Date(raw.end?.dateTime ?? raw.end?.date ?? start);
  // Google's all-day end date is exclusive (the day after the event) - step back so it reads as the last included day.
  const end = allDay ? new Date(rawEnd.getTime() - 1) : rawEnd;

  return {
    id: raw.id,
    title: raw.summary?.trim() || "Untitled event",
    description: raw.description ?? "",
    location: raw.location ?? "",
    htmlLink: raw.htmlLink ?? "",
    start: start.toISOString(),
    end: end.toISOString(),
    allDay,
    attachments: (raw.attachments ?? []).map(normalizeAttachment),
  };
}

function normalizeAttachment(attachment: RawGoogleAttachment): CalendarAttachment {
  const mimeType = attachment.mimeType ?? "";
  const isImage = mimeType.startsWith("image/");

  return {
    title: attachment.title ?? "Attachment",
    mimeType,
    fileUrl: attachment.fileUrl ?? "",
    iconLink: attachment.iconLink ?? "",
    // The legacy uc?export=view endpoint blocks embedded <img> requests even for public files;
    // the thumbnail endpoint is what Drive actually serves for hotlinking.
    imageSrc: isImage && attachment.fileId ? `https://drive.google.com/thumbnail?id=${attachment.fileId}&sz=w2000` : null,
  };
}
