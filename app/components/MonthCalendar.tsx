"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronIcon } from "./ChevronIcon";
import { EventAttachmentPreview } from "./EventAttachmentPreview";
import { formatEventTime, isFeaturedEvent, parseEventDescription, stripFeaturedPrefix } from "../lib/eventDisplay";
import type { CalendarEventDetail } from "../lib/googleCalendar";
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
          <ChevronIcon direction="left" />
        </Link>
        <h2>{monthLabel}</h2>
        <Link className="month-nav" href={nextHref} aria-label="Next month" scroll={false}>
          <ChevronIcon direction="right" />
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
                    <span className={`month-day-chip${isFeaturedEvent(event.title) ? " featured-title" : ""}`} key={event.id}>
                      {stripFeaturedPrefix(event.title)}
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
  const { text: description, url: rsvpUrl } = parseEventDescription(event.description);

  return (
    <article className={`event-detail-card${heroImage ? " with-image" : ""}`}>
      {heroImage && (
        <div className="event-detail-media">
          <EventAttachmentPreview attachment={heroImage} />
        </div>
      )}
      <div className="event-detail-body">
        <h3 className={isFeaturedEvent(event.title) ? "featured-title" : undefined}>{stripFeaturedPrefix(event.title)}</h3>
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
              <EventAttachmentPreview attachment={attachment} key={`${event.id}-${index}`} />
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

function formatModalDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
