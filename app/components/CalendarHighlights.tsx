"use client";

import { useEffect, useState } from "react";
import type { CalendarEvent } from "../data";
import { formatRange, getStatus, startOfDay } from "../lib/calendar";

export function CalendarHighlights({ events }: { events: CalendarEvent[] }) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  return (
    <div className="calendar-list">
      {events.map((event) => {
        const status = getStatus(event, today);
        const statusClass = status === "Now" ? "status-now" : status === "Upcoming" ? "status-upcoming" : "status-past";

        return (
          <article className="calendar-item" key={event.id}>
            <div className="calendar-date">{formatRange(event)}</div>
            <h3>{event.title}</h3>
            <span className={`calendar-status ${statusClass}`}>{status}</span>
          </article>
        );
      })}
    </div>
  );
}
