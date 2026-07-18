import type { Metadata } from "next";
import { MonthCalendar } from "../components/MonthCalendar";
import { fetchMonthEvents, hasGoogleCalendarConfig } from "../lib/googleCalendar";
import { addMonths, toDateKey } from "../lib/monthGrid";

export const metadata: Metadata = {
  title: "Calendar V2 | OTY NYC",
  description: "Browse OTY NYC's live Google Calendar in a custom month view.",
};

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarV2PageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function CalendarV2Page({ searchParams }: CalendarV2PageProps) {
  const params = await searchParams;
  const today = new Date();
  const year = parseInt(params.year ?? "", 10) || today.getFullYear();
  const month = clampMonth(parseInt(params.month ?? "", 10) || today.getMonth() + 1);

  if (!hasGoogleCalendarConfig()) {
    return (
      <main className="subpage-main" id="main">
        <section className="page-hero" aria-labelledby="calendar-v2-title">
          <div>
            <p className="section-kicker">Live Calendar</p>
            <h1 id="calendar-v2-title">Calendar V2 isn&apos;t configured yet.</h1>
            <p>
              Set the <code>GOOGLE_CALENDAR_API_KEY</code> and <code>GOOGLE_CALENDAR_ID</code> environment variables
              to connect a Google Calendar to this page.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const { events, error } = await fetchMonthEvents(year, month);
  const previous = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <main className="subpage-main" id="main">
      <section className="page-hero" aria-labelledby="calendar-v2-title">
        <div>
          <p className="section-kicker">Live Calendar</p>
          <h1 id="calendar-v2-title">OTY NYC events, straight from Google Calendar.</h1>
          <p>Tap a day with events to see full details, including any attached images.</p>
        </div>
      </section>

      <section className="section route-section" aria-label="Google Calendar month view">
        {error && <p className="calendar-error">{error}</p>}
        <MonthCalendar
          events={events}
          year={year}
          month={month}
          monthLabel={monthLabel}
          prevHref={`/calendar-v2?year=${previous.year}&month=${previous.month}`}
          nextHref={`/calendar-v2?year=${next.year}&month=${next.month}`}
          todayKey={toDateKey(today)}
        />
      </section>
    </main>
  );
}

function clampMonth(month: number): number {
  return Math.min(12, Math.max(1, month));
}
