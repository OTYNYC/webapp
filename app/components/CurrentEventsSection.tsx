"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CalendarEvent, FeaturedEvent } from "../data";
import { formatRange, getStatus, startOfDay, toDate } from "../lib/calendar";
import { ChevronIcon } from "./ChevronIcon";

interface EventCard {
  meta: string;
  title: string;
  body: string;
}

interface CurrentEventsSectionProps {
  calendarEvents: CalendarEvent[];
  featuredEvents: FeaturedEvent[];
}

export function CurrentEventsSection({ calendarEvents, featuredEvents }: CurrentEventsSectionProps) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  const cards = useMemo(() => getEventCards(today, calendarEvents), [calendarEvents, today]);
  const visibleFeaturedEvents = useMemo(() => getFeaturedEvents(featuredEvents), [featuredEvents]);

  return (
    <section className="current-strip" id="current" aria-labelledby="events-title">
      <p className="section-kicker">Current Events</p>
      <div className="section-heading compact">
        <div>
          <h2 id="events-title">What to keep close this week</h2>
          <p>Church calendar notes, gathering prompts, and practical NYC links.</p>
        </div>
        <Link className="text-link" href="/calendar">
          Full 2026 calendar
        </Link>
      </div>
      <div className="current-layout">
        <FeaturedEventsCarousel events={visibleFeaturedEvents} today={today} />
        <div className="event-grid" aria-live="polite">
          {cards.map((card) => (
            <article className="event-card" key={`${card.meta}-${card.title}`}>
              <span className="event-meta">{card.meta}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedEventsCarousel({ events, today }: { events: FeaturedEvent[]; today: Date | null }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), events.length - 1);
    const slide = trackRef.current?.children.item(nextIndex);

    setActiveIndex(nextIndex);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const updateActiveSlide = () => {
    const track = trackRef.current;
    if (!track) return;

    const trackLeft = track.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  if (events.length === 0) {
    return <FeaturedEventCard event={null} today={today} />;
  }

  return (
    <div className="featured-events-carousel" aria-roledescription="carousel" aria-label="Featured and recent OTY events">
      {events.length > 1 && (
        <div className="carousel-controls featured-controls">
          <button type="button" aria-label="Previous featured event" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}>
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            aria-label="Next featured event"
            onClick={() => goTo(activeIndex + 1)}
            disabled={activeIndex === events.length - 1}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
      <div className="featured-events-track" ref={trackRef} onScroll={updateActiveSlide}>
        {events.map((event, index) => (
          <div className="featured-event-slide" key={event.id} aria-roledescription="slide" aria-label={`${index + 1} of ${events.length}`}>
            <FeaturedEventCard event={event} today={today} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedEventCard({ event, today }: { event: FeaturedEvent | null; today: Date | null }) {
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "square">("landscape");

  if (!event) {
    return (
      <article className="featured-event empty-featured">
        <div className="featured-event-body">
          <span className="event-meta">Featured Event</span>
          <h3>More OTY events coming soon</h3>
          <p>New gatherings can be added from the admin dashboard once details are confirmed.</p>
        </div>
      </article>
    );
  }

  const eventDate = toDate(event.date);
  const label = today && eventDate < today ? "Recent Event" : event.label;

  return (
    <article className="featured-event">
      <figure className={`featured-event-media ${orientation}`}>
        <img
          src={event.image}
          alt={event.alt}
          width="920"
          height="1150"
          loading="lazy"
          onLoad={(image) => {
            const { naturalHeight, naturalWidth } = image.currentTarget;
            const ratio = naturalWidth / Math.max(1, naturalHeight);

            setOrientation(ratio > 1.12 ? "landscape" : ratio < 0.88 ? "portrait" : "square");
          }}
        />
      </figure>
      <div className="featured-event-body">
        <span className="event-meta">{label}</span>
        <h3>{event.title}</h3>
        <p>{event.summary}</p>
      </div>
    </article>
  );
}

function getEventCards(today: Date | null, calendarEvents: CalendarEvent[]): EventCard[] {
  const chronologicalEvents = [...calendarEvents].sort((first, second) => toDate(first.start).getTime() - toDate(second.start).getTime());
  const current = today ? chronologicalEvents.find((event) => getStatus(event, today) === "Now") : null;
  const next = today
    ? chronologicalEvents.find((event) => toDate(event.start) >= today && getStatus(event, today) !== "Now")
    : null;

  return [
    current
      ? {
          meta: "Now",
          title: current.title,
          body: `${formatRange(current)}. Use the vegan map and church directory to plan the week.`,
        }
      : {
          meta: "Calendar",
          title: "2026 calendar highlights",
          body: "Review the feast and fasting dates and keep an eye on OTY NYC for gatherings.",
        },
    next
      ? {
          meta: "Upcoming",
          title: next.title,
          body: `${formatRange(next)}. Add it to your calendar and check in with your parish.`,
        }
      : {
          meta: "Upcoming",
          title: "More dates coming",
          body: "OTY NYC can update this section as new events and church gatherings are confirmed.",
        },
    {
      meta: "Every Week",
      title: "Find Sunday service",
      body: "Browse Bronx, Brooklyn, Manhattan, and Queens churches for Divine Liturgy, Kidan, Vespers, and Bible study.",
    },
  ];
}

function getFeaturedEvents(featuredEvents: FeaturedEvent[]) {
  return [...featuredEvents]
    .filter((event) => event.published)
    .sort((first, second) => toDate(second.date).getTime() - toDate(first.date).getTime());
}
