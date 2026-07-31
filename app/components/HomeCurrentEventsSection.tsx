"use client";

import Link from "next/link";
import { formatEventDateRange, stripFeastFastPrefix } from "../lib/eventDisplay";
import type { CalendarEventDetail, FeastFastItem } from "../lib/googleCalendar";
import { ChurchIcon, CrossIcon } from "./QuickInfoIcons";
import { UpcomingFeaturedEvent } from "./UpcomingFeaturedEvent";

interface HomeCurrentEventsSectionProps {
  featuredCalendarEvents: CalendarEventDetail[];
  featuredUnavailable?: boolean;
  feastFastItems: FeastFastItem[];
  feastFastUnavailable?: boolean;
}

export function HomeCurrentEventsSection({
  featuredCalendarEvents,
  featuredUnavailable = false,
  feastFastItems,
  feastFastUnavailable = false,
}: HomeCurrentEventsSectionProps) {
  return (
    <section className="current-strip home-current-events" id="current" aria-labelledby="events-title">
      <p className="section-kicker">Current Events</p>
      <div className="section-heading compact">
        <div>
          <h2 id="events-title">
            What to <span className="text-accent-gold">keep close</span> this week
          </h2>
        </div>
        <Link className="text-link" href="/calendar">
          View Full Calendar
        </Link>
      </div>
      <div className="current-layout">
        <UpcomingFeaturedEvent events={featuredCalendarEvents} unavailable={featuredUnavailable} />

        <div className="quick-info-panel" aria-live="polite">
          {feastFastItems.length > 0 ? (
            feastFastItems.map((item) => (
              <div className="quick-info-item" key={item.event.id}>
                <span className="quick-info-icon">
                  <CrossIcon />
                </span>
                <div>
                  <strong>{stripFeastFastPrefix(item.event.title)}</strong>
                  <p>{formatEventDateRange(item.event)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="quick-info-item">
              <span className="quick-info-icon">
                <CrossIcon />
              </span>
              <div>
                {/* An unreachable calendar must not be reported as "nothing scheduled". */}
                {feastFastUnavailable ? (
                  <>
                    <strong>Feasts and fasts are unavailable right now</strong>
                    <p>We could not reach the calendar. Check the full 2026 calendar for the complete schedule.</p>
                  </>
                ) : (
                  <>
                    <strong>No upcoming feasts or fasts</strong>
                    <p>Check the full 2026 calendar for the complete schedule.</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="quick-info-item">
            <span className="quick-info-icon">
              <ChurchIcon />
            </span>
            <div>
              <strong>Find a Church</strong>
              <p>
                Find a church near you and view church service schedules including Divine Liturgy, Kidan, Vespers and
                Bible study.
              </p>
              <Link className="text-link quick-info-link" href="/churches">
                Open church directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
