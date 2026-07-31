"use client";

import { useState } from "react";
import { ChevronIcon } from "./ChevronIcon";
import { formatEventDateTime, isFeaturedEvent, parseEventDescription, stripFeaturedPrefix } from "../lib/eventDisplay";
import type { CalendarEventDetail } from "../lib/googleCalendar";

export function UpcomingFeaturedEvent({ events }: { events: CalendarEventDetail[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (events.length === 0) {
    return (
      <article className="featured-event empty-featured">
        <div className="featured-event-body">
          <span className="event-meta">Featured Event</span>
          <h3>More OTY events coming soon</h3>
          <p>Check back for upcoming learning, fellowship and service events.</p>
        </div>
      </article>
    );
  }

  const index = Math.min(activeIndex, events.length - 1);
  const event = events[index];

  const goTo = (nextIndex: number) => {
    setActiveIndex(Math.min(Math.max(nextIndex, 0), events.length - 1));
  };

  return (
    <div className="featured-events-carousel" aria-roledescription="carousel" aria-label="Upcoming LR, Service, and Fellowship events">
      {events.length > 1 && (
        <div className="carousel-controls featured-controls">
          <button type="button" aria-label="Previous event" onClick={() => goTo(index - 1)} disabled={index === 0}>
            <ChevronIcon direction="left" />
          </button>
          <button type="button" aria-label="Next event" onClick={() => goTo(index + 1)} disabled={index === events.length - 1}>
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
      <FeaturedEventCard event={event} key={event.id} />
    </div>
  );
}

function FeaturedEventCard({ event }: { event: CalendarEventDetail }) {
  const [orientation, setOrientation] = useState<"landscape" | "portrait" | "square">("landscape");
  const [imageFailed, setImageFailed] = useState(false);
  const heroImage = event.attachments.find((attachment) => attachment.imageSrc);
  const { text: description, url: rsvpUrl } = parseEventDescription(event.description);

  return (
    <article className="featured-event">
      {heroImage?.imageSrc && !imageFailed && (
        <figure className={`featured-event-media ${orientation}`}>
          <img
            src={heroImage.imageSrc}
            alt={heroImage.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            onLoad={(image) => {
              const { naturalHeight, naturalWidth } = image.currentTarget;
              const ratio = naturalWidth / Math.max(1, naturalHeight);

              setOrientation(ratio > 1.12 ? "landscape" : ratio < 0.88 ? "portrait" : "square");
            }}
          />
        </figure>
      )}
      <div className="featured-event-body">
        <span className="event-meta">{formatEventDateTime(event)}</span>
        <h3 className={isFeaturedEvent(event.title) ? "featured-title" : undefined}>{stripFeaturedPrefix(event.title)}</h3>
        {event.location && <p className="featured-event-location">{event.location}</p>}
        {description && <p>{description}</p>}
        {(rsvpUrl || event.htmlLink) && (
          <div className="featured-event-actions">
            {rsvpUrl && (
              <a className="button button-primary featured-event-rsvp" href={rsvpUrl} target="_blank" rel="noreferrer">
                RSVP
              </a>
            )}
            {event.htmlLink && (
              <a
                className="featured-event-external-link"
                href={event.htmlLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in Google Calendar"
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
