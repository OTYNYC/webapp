"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { calendarEvents, moments, type Moment } from "./data";
import { formatRange, getStatus, startOfDay, toDate } from "./lib/calendar";

interface EventCard {
  meta: string;
  title: string;
  body: string;
}

export default function Home() {
  const [today, setToday] = useState<Date | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  useEffect(() => {
    if (!selectedMoment) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMoment(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMoment]);

  useEffect(() => {
    let frame = 0;

    const updateReveal = () => {
      const section = document.querySelector<HTMLElement>("[data-scroll-reveal]");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollRange));

      setRevealProgress(progress);
    };

    const requestUpdate = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateReveal();
      });
    };

    updateReveal();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const cards = useMemo(() => getEventCards(today), [today]);

  return (
    <>
      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <img
            className="hero-backdrop"
            src="/assets/palm-sunday-community.jpeg"
            alt=""
            width="3840"
            height="4112"
          />
          <div className="hero-overlay" />
          <div className="hero-shell">
            <div className="hero-content">
              <img className="hero-logo" src="/assets/oty-logo.png" alt="" width="154" height="136" />
              <p className="eyebrow">Orthodox Tewahedo Youth in New York City</p>
              <h1 id="hero-title">Faith, fellowship, and Orthodox life in NYC.</h1>
              <p className="hero-copy">
                OTY NYC helps young Orthodox Tewahedo Christians grow in the Church&apos;s history, dogma, canons, and
                rites while building a steady community for city life.
              </p>
              <div className="hero-actions" aria-label="Primary actions">
                <Link className="button button-primary" href="/churches">
                  Find a church
                </Link>
                <a className="button button-secondary" href="https://instagram.com/oty.nyc" target="_blank" rel="noreferrer">
                  Follow updates
                </a>
              </div>
            </div>
            <figure className="hero-photo-card">
              <img
                className="hero-media"
                src="/assets/palm-sunday-community.jpeg"
                alt="OTY NYC community gathered after church"
                width="3840"
                height="4112"
              />
            </figure>
          </div>
        </section>

        <section className="current-strip" id="current" aria-labelledby="events-title">
          <div className="section-kicker">Current Events</div>
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
            <article className="featured-event">
              <img
                src="/assets/holy-matrimony-panel.avif"
                alt="Holy Matrimony Panel event poster"
                width="920"
                height="1150"
                loading="lazy"
              />
              <div>
                <span className="event-meta">Featured Event</span>
                <h3>Holy Matrimony Panel</h3>
                <p>Saturday, June 27, 2026 at 2:00 PM. A community discussion at 241 E 62nd Street, New York, NY.</p>
              </div>
            </article>
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

        <section className="section destination-section" aria-labelledby="destinations-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Plan Your Week</p>
              <h2 id="destinations-title">Go straight to the most useful OTY NYC resources.</h2>
              <p>Churches, calendar dates, and fasting food links are grouped for quick planning.</p>
            </div>
          </div>
          <div className="destination-grid">
            <Link className="destination-card" href="/churches">
              <span>Church Guide</span>
              <h3>Find Orthodox services across NYC.</h3>
              <p>Search by borough, language, priest, tradition, or service time.</p>
              <small>Open directory</small>
            </Link>
            <Link className="destination-card" href="/calendar">
              <span>Calendar</span>
              <h3>Follow 2026 feasts and fasting seasons.</h3>
              <p>See what is current, what is upcoming, and what has passed.</p>
              <small>View calendar</small>
            </Link>
            <Link className="destination-card" href="/fasting">
              <span>Fasting Food</span>
              <h3>Keep the fast with NYC food options.</h3>
              <p>Open the fasting-friendly map and check quick practical notes.</p>
              <small>Open guide</small>
            </Link>
          </div>
        </section>

        <section className="section mission-section" id="mission" aria-labelledby="mission-title">
          <div className="mission-copy">
            <p className="section-kicker">Our Mission</p>
            <h2 id="mission-title">Rooted in the Orthodox Tewahedo faith, shaped for New York life.</h2>
            <p>
              OTY NYC guides young Orthodox Tewahedo Christians into a deeper understanding of their faith and supports
              them in living an authentic Orthodox life amid the challenges of New York City.
            </p>
            <p>
              We provide core knowledge of Church history, dogma, canons, and rites that many have not had the
              opportunity to learn, while fostering fellowship, service, and mentorship that strengthens both spiritual
              and everyday life.
            </p>
          </div>
          <div className="mission-card" aria-label="OTY NYC focus areas">
            <img src="/assets/oty-logo.png" alt="OTY NYC official logo" width="258" height="227" />
            <div className="focus-list">
              <span>Learn the faith</span>
              <span>Find services</span>
              <span>Keep the fast</span>
              <span>Build fellowship</span>
            </div>
          </div>
        </section>

        <section className="section rhythm-section" aria-labelledby="rhythm-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Community Rhythm</p>
              <h2 id="rhythm-title">A practical path for young Orthodox Christians.</h2>
            </div>
          </div>
          <div className="rhythm-grid">
            {[
              ["01", "Learn", "Clear teaching on Church history, dogma, canons, rites, and the meaning behind the practices."],
              ["02", "Worship", "Help finding Divine Liturgy, Kidan, Vespers, Bible study, and speaker nights across the city."],
              ["03", "Fellowship", "Spaces for friendship, questions, mentorship, and honest support in school, work, and city life."],
              ["04", "Serve", "Opportunities to strengthen parish life and care for the community with consistency."],
            ].map(([number, title, body]) => (
              <article key={title}>
                <span className="number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section moments-section" aria-labelledby="moments-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Community Moments</p>
              <h2 id="moments-title">Recent gatherings and shared milestones.</h2>
            </div>
          </div>
          <div className="moments-grid">
            {moments.map((moment) => (
              <button className="moment-card" key={moment.id} type="button" onClick={() => setSelectedMoment(moment)}>
                <img src={moment.image} alt={moment.alt} width="4032" height="3024" loading="lazy" />
                <div>
                  <span>{moment.label}</span>
                  <h3>{moment.title}</h3>
                  <small>View details</small>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section
          className="orthodox-reveal"
          data-scroll-reveal
          style={
            {
              "--reveal-progress": revealProgress,
              "--reveal-mask": `${Math.max(0, 18 - revealProgress * 18)}%`,
              "--reveal-scale": 1.07 - revealProgress * 0.07,
              "--icon-scale": 1 + revealProgress * 0.08,
            } as CSSProperties
          }
          aria-labelledby="reveal-title"
        >
          <div className="cross-field" aria-hidden="true">
            {Array.from({ length: 10 }).map((_, index) => (
              <span className="cross-mark" key={index} />
            ))}
          </div>
          <div className="reveal-shell">
            <div className="reveal-story">
              <div className="reveal-copy">
                <p className="section-kicker">Orthodox Life</p>
                <h2 id="reveal-title">A faith carried through worship, service, and fellowship.</h2>
                <p>
                  OTY NYC is built around the rhythm of the Church: learning the faith, gathering for prayer, sharing
                  meals, serving together, and staying rooted while living in New York City.
                </p>
              </div>
              <div className="reveal-steps" aria-label="Orthodox life focus areas">
                {[
                  ["Learn", "Church history, dogma, canons, and rites are taught in a way young adults can carry into daily life."],
                  ["Gather", "Prayer, fellowship meals, panel conversations, and parish visits keep the community connected."],
                  ["Serve", "OTY NYC helps young Orthodox Christians support parish life and care for one another with consistency."],
                ].map(([title, body]) => (
                  <article className="reveal-step" key={title}>
                    <span>{title}</span>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="reveal-image-column">
              <figure className="reveal-frame">
                <img
                  src="/assets/orthodox-life-gathering.jpeg"
                  alt="OTY NYC community gathered with clergy and young adults"
                  width="4032"
                  height="3024"
                  loading="lazy"
                />
              </figure>
              <div className="reveal-caption">
                <span>Community Moment</span>
                <p>Fellowship with OTY NYC, clergy, and friends after a community gathering.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-band" aria-labelledby="contact-title">
          <div>
            <p className="section-kicker">Stay Connected</p>
            <h2 id="contact-title">Questions, updates, or a church schedule correction?</h2>
          </div>
          <div className="contact-actions">
            <a className="button button-light" href="mailto:contact.otynyc@gmail.com">
              Email OTY NYC
            </a>
            <a className="button button-outline-light" href="https://instagram.com/oty.nyc" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </section>
      </main>

      {selectedMoment && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedMoment(null)}>
          <section
            className="moment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="moment-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setSelectedMoment(null)}>
              Close
            </button>
            <img src={selectedMoment.image} alt={selectedMoment.alt} width="1200" height="900" />
            <div>
              <span>{selectedMoment.label}</span>
              <h2 id="moment-modal-title">{selectedMoment.title}</h2>
              <p>{selectedMoment.details}</p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function getEventCards(today: Date | null): EventCard[] {
  const current = today ? calendarEvents.find((event) => getStatus(event, today) === "Now") : null;
  const next = today ? calendarEvents.find((event) => toDate(event.start) >= today && getStatus(event, today) !== "Now") : null;

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
