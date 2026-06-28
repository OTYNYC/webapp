"use client";

import { useEffect, useState } from "react";
import { calendarEvents } from "../data";
import { formatRange, getStatus, startOfDay } from "../lib/calendar";

export function CalendarHighlights() {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  return (
    <div className="calendar-list">
      {calendarEvents.map((event) => {
        const status = getStatus(event, today);
        const statusClass = status === "Now" ? "status-now" : status === "Upcoming" ? "status-upcoming" : "status-past";

        return (
          <article className="calendar-item" key={event.title}>
            <div className="calendar-date">{formatRange(event)}</div>
            <h3>{event.title}</h3>
            <span className={`calendar-status ${statusClass}`}>{status}</span>
          </article>
        );
      })}
    </div>
  );
}
