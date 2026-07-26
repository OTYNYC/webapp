"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CurrentEventsSection } from "./components/CurrentEventsSection";
import { MomentsCarousel } from "./components/MomentsCarousel";
import { mission } from "./data";
import type { CalendarEvent, FeaturedEvent, Moment } from "./data";

interface HomeClientProps {
  content: {
    calendarEvents: CalendarEvent[];
    featuredEvents: FeaturedEvent[];
    moments: Moment[];
  };
}

export function HomeClient({ content }: HomeClientProps) {
  const { calendarEvents, featuredEvents, moments } = content;
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [revealProgress, setRevealProgress] = useState(0);

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

  const visibleMoments = useMemo(() => moments.filter((moment) => moment.published), [moments]);

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

        <CurrentEventsSection calendarEvents={calendarEvents} featuredEvents={featuredEvents} />

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
            <p className="section-kicker">{mission.kicker}</p>
            <h2 id="mission-title">{mission.heading}</h2>
            {mission.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mission-card" aria-label="OTY NYC focus areas">
            <img src="/assets/oty-logo.png" alt="OTY NYC official logo" width="258" height="227" />
            <div className="focus-list">
              {mission.focusAreas.map((focusArea) => (
                <span key={focusArea}>{focusArea}</span>
              ))}
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
          <MomentsCarousel moments={visibleMoments} onSelect={setSelectedMoment} />
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
