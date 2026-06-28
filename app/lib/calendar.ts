import type { CalendarEvent } from "../data";

export type EventStatus = "Now" | "Upcoming" | "Past";

export function getStatus(event: CalendarEvent, today: Date | null): EventStatus {
  if (!today) return "Upcoming";

  const start = toDate(event.start);
  const end = toDate(event.end);

  if (today >= start && today <= end) return "Now";
  if (today < start) return "Upcoming";
  return "Past";
}

export function formatRange(event: CalendarEvent): string {
  const start = toDate(event.start);
  const end = toDate(event.end);
  const sameDay = start.getTime() === end.getTime();
  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return sameDay ? endText : `${startText}-${endText}`;
}

export function toDate(value: string): Date {
  return startOfDay(new Date(`${value}T00:00:00`));
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
