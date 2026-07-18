"use client";

import Link from "next/link";
import { useState } from "react";
import type { CalendarAttachment, CalendarEventDetail } from "../lib/googleCalendar";
import { getMonthGridDays, toDateKey } from "../lib/monthGrid";

interface MonthCalendarProps {
  events: CalendarEventDetail[];
  year: number;
  month: number;
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  todayKey: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ events, year, month, monthLabel, prevHref, nextHref, todayKey }: MonthCalendarProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const gridDays = getMonthGridDays(year, month);
  const eventsByDay = groupEventsByDay(events, gridDays);
  const selectedEvents = selectedDateKey ? (eventsByDay[selectedDateKey] ?? []) : [];

  return (
    <div className="month-calendar">
      <div className="month-calendar-toolbar">
        <Link className="month-nav" href={prevHref} aria-label="Previous month" scroll={false}>
          &lt;
        </Link>
        <h2>{monthLabel}</h2>
        <Link className="month-nav" href={nextHref} aria-label="Next month" scroll={false}>
          &gt;
        </Link>
      </div>

      <div className="month-grid-weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="month-grid" role="grid" aria-label={monthLabel}>
        {gridDays.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = eventsByDay[dateKey] ?? [];
          const inMonth = day.getMonth() === month - 1;
          const isToday = dateKey === todayKey;

          return (
            <button
              type="button"
              key={dateKey}
              className={`month-day${inMonth ? "" : " outside"}${isToday ? " today" : ""}${dayEvents.length ? " has-events" : ""}`}
              onClick={() => dayEvents.length > 0 && setSelectedDateKey(dateKey)}
              disabled={dayEvents.length === 0}
              aria-label={`${day.getDate()}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
            >
              <span className="month-day-number">{day.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="month-day-chips">
                  {dayEvents.slice(0, 3).map((event) => (
                    <span className={`month-day-chip${isLREvent(event.title) ? " lr-event" : ""}`} key={event.id}>
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 3 && <span className="month-day-chip more">+{dayEvents.length - 3} more</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDateKey && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedDateKey(null)}>
          <section
            className="event-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelectedDateKey(null)}>
              Close
            </button>
            <h2 id="event-modal-title">{formatModalDate(selectedDateKey)}</h2>
            <div className="event-detail-list">
              {selectedEvents.map((event) => (
                <EventDetailCard event={event} key={event.id} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function EventDetailCard({ event }: { event: CalendarEventDetail }) {
  const heroImage = event.attachments.find((attachment) => attachment.imageSrc);
  const otherAttachments = event.attachments.filter((attachment) => attachment !== heroImage);
  const { text: description, url: rsvpUrl } = extractLink(event.description);

  return (
    <article className={`event-detail-card${heroImage ? " with-image" : ""}`}>
      {heroImage && (
        <div className="event-detail-media">
          <AttachmentPreview attachment={heroImage} />
        </div>
      )}
      <div className="event-detail-body">
        <h3 className={isLREvent(event.title) ? "lr-event" : undefined}>{event.title}</h3>
        <p className="event-detail-time">{formatEventTime(event)}</p>
        {event.location && <p className="event-detail-location">{event.location}</p>}
        {description && <p className="event-detail-description">{description}</p>}
        {rsvpUrl && (
          <a className="button button-primary event-detail-rsvp" href={rsvpUrl} target="_blank" rel="noreferrer">
            RSVP
          </a>
        )}
        {otherAttachments.length > 0 && (
          <div className="event-detail-attachments">
            {otherAttachments.map((attachment, index) => (
              <AttachmentPreview attachment={attachment} key={`${event.id}-${index}`} />
            ))}
          </div>
        )}
        {event.htmlLink && (
          <a className="text-link" href={event.htmlLink} target="_blank" rel="noreferrer">
            Open in Google Calendar
          </a>
        )}
      </div>
    </article>
  );
}

function AttachmentPreview({ attachment }: { attachment: CalendarAttachment }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (attachment.imageSrc && !imageFailed) {
    return (
      <a className="attachment-image" href={attachment.fileUrl || attachment.imageSrc} target="_blank" rel="noreferrer">
        <img src={attachment.imageSrc} alt={attachment.title} loading="lazy" onError={() => setImageFailed(true)} />
      </a>
    );
  }

  return (
    <a className="attachment-file" href={attachment.fileUrl} target="_blank" rel="noreferrer">
      {attachment.iconLink && <img src={attachment.iconLink} alt="" width="16" height="16" />}
      {imageFailed ? "View image (not public yet)" : attachment.title}
    </a>
  );
}

function groupEventsByDay(events: CalendarEventDetail[], gridDays: Date[]): Record<string, CalendarEventDetail[]> {
  const gridKeys = new Set(gridDays.map(toDateKey));
  const map: Record<string, CalendarEventDetail[]> = {};

  for (const event of events) {
    const endKey = toDateKey(new Date(event.end));
    let cursor = new Date(event.start);
    let cursorKey = toDateKey(cursor);
    let guard = 0;

    while (cursorKey <= endKey && guard < 62) {
      if (gridKeys.has(cursorKey)) {
        (map[cursorKey] ??= []).push(event);
      }

      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
      cursorKey = toDateKey(cursor);
      guard += 1;
    }
  }

  return map;
}

function formatEventTime(event: CalendarEventDetail): string {
  if (event.allDay) return "All day";

  const start = new Date(event.start);
  const end = new Date(event.end);
  const startText = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endText = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return `${startText} - ${endText}`;
}

const LR_PREFIX_PATTERN = /^lr(?=[\s:-]|$)/i;

function isLREvent(title: string): boolean {
  return LR_PREFIX_PATTERN.test(title.trim());
}

const URL_PATTERN = /https?:\/\/\S+/i;
const TRAILING_PUNCTUATION_PATTERN = /[.,;:!?)\]]+$/;

function extractLink(description: string): { text: string; url: string | null } {
  const match = description.match(URL_PATTERN);

  if (!match || match.index === undefined) {
    return { text: description, url: null };
  }

  const text = (description.slice(0, match.index) + description.slice(match.index + match[0].length))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, url: match[0].replace(TRAILING_PUNCTUATION_PATTERN, "") };
}

function formatModalDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
