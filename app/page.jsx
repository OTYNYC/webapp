"use client";

import { useEffect, useMemo, useState } from "react";

const churches = [
  {
    borough: "Bronx",
    name: "Beata Le Mariam Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Amharic, Ge'ez",
    priest: "Abba Ephreim",
    website: "https://nybeaataeotc.org/",
    email: "mariam@nybeaataeotc.org",
    phone: "",
    map: "https://maps.app.goo.gl/5VMwvjtNotP4qgte8",
    transit: "1 minute walk from the 6 train - Cypress Ave stop",
    services: ["Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Bronx",
    name: "Medhanyalem Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "Amharic, Ge'ez",
    priest: "Kesis Berhanu",
    website: "http://www.medhanialem.org/",
    email: "contactEOTCOS@medhanialem.org",
    phone: "(347) 947-4361",
    map: "https://maps.app.goo.gl/7zYJcaKH34WjVu838",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Prayer of the Covenant (Kidan) on Saturdays: 7-8:30 AM", "Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Bronx",
    name: "Holy Trinity Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Amharic, Ge'ez",
    priest: "Kesis Ephrem",
    website: "",
    email: "info@holytrinityeotcny.org",
    phone: "(718) 299-2741",
    map: "https://maps.app.goo.gl/adticJM7QQWvm7Kf8",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Prayer of Covenant (Kidane) on Saturdays: 7-8:30 AM", "Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Brooklyn",
    name: "Saint George Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Ge'ez",
    priest: "Kesis Mahitama Selassie",
    website: "https://stgeorgeeotc.vercel.app/",
    email: "msstgeorge.eotc.ny@gmail.com",
    phone: "+1 516 343 1873",
    map: "https://maps.app.goo.gl/oRDas7EmtLmqBcZX7",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: [
      "7-10:30 AM",
      "Divine Liturgy is usually once a month according to the website calendar. Other Sundays may be Prayer of the Covenant.",
    ],
  },
  {
    borough: "Manhattan",
    name: "Saint Mary Saint Mark Coptic Orthodox Church - Midtown East",
    tradition: "Coptic Orthodox",
    languages: "Mostly English, with some Coptic and Arabic",
    priest: "Abouna Gregory",
    website: "https://www.stmarystmarkmanhattan.com",
    email: "hello@stmarystmarkmanhattan.com",
    phone: "",
    map: "https://maps.app.goo.gl/59fNKYjVXXkpZqA58",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: [
      "Monday Speaker Night: 7:30-9:30 PM",
      "Thursday Bible Study: 7:30-9:30 PM",
      "Saturday Vespers: 7-9 PM",
      "Sunday Divine Liturgy: 8:30-11 AM",
    ],
  },
  {
    borough: "Queens",
    name: "Saint George Coptic Orthodox Church - Astoria",
    tradition: "Coptic Orthodox",
    languages: "English, Coptic, and Arabic",
    priest: "Abouna Yostos, Abouna Sorial",
    website: "https://www.stgeorgeastoria.church",
    email: "contact@stgeorgeastoria.church",
    phone: "929-260-3708",
    map: "https://maps.app.goo.gl/tpR8BuaXA4tixQCv5",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Saturday Vespers: 6-9 PM", "Sunday Divine Liturgy: 6-8:30 AM and 9-11:30 AM"],
  },
  {
    borough: "Queens",
    name: "Saint Mary Saint Antonios Coptic Orthodox Church - Ridgewood",
    tradition: "Coptic Orthodox",
    languages: "Mostly English, with some Coptic and Arabic",
    priest: "Abouna Youhanna, Abouna Antonios, Abouna Eshak, Abouna Jacob",
    website: "https://copticchurch.org/",
    email: "",
    phone: "",
    map: "https://maps.app.goo.gl/2JxLJo3yNSv326tt9",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Bible Study on Tuesdays: 7:30-9 PM", "Sunday Divine Liturgy: 8-11 AM"],
  },
];

const calendarEvents = [
  { title: "Lidet (Nativity of Our Lord and Savior Jesus Christ)", start: "2026-01-07", end: "2026-01-07" },
  { title: "Ketera (Eve of Epiphany)", start: "2026-01-18", end: "2026-01-18" },
  { title: "Timket (Epiphany)", start: "2026-01-19", end: "2026-01-19" },
  { title: "Cana of Galilee", start: "2026-01-20", end: "2026-01-20" },
  { title: "Fast of Nineveh", start: "2026-02-02", end: "2026-02-04" },
  { title: "Abiy Tsom (Great Lent Fast)", start: "2026-02-18", end: "2026-04-12" },
  { title: "Debre Zeit (Midway marker of Great Lent Fast)", start: "2026-03-15", end: "2026-03-15" },
  { title: "Hosanna (Palm Sunday)", start: "2026-04-05", end: "2026-04-05" },
  { title: "Good Friday", start: "2026-04-10", end: "2026-04-10" },
  { title: "Orthodox Easter", start: "2026-04-12", end: "2026-04-12" },
  { title: "Irget (Ascension of Our Lord and Savior Jesus Christ)", start: "2026-05-21", end: "2026-05-21" },
  { title: "Peraklitos (Pentecost)", start: "2026-05-31", end: "2026-05-31" },
  { title: "Tsome Hawariyat (Fast of the Apostles)", start: "2026-06-01", end: "2026-07-12" },
  { title: "Tsome Filseta (Fast of the Assumption of Our Lady Mary)", start: "2026-08-07", end: "2026-08-22" },
  { title: "Debre Tabor (Transfiguration of Our Lord and Savior Jesus Christ)", start: "2026-08-19", end: "2026-08-19" },
];

const boroughs = ["All", "Bronx", "Brooklyn", "Manhattan", "Queens"];

const moments = [
  {
    id: "palm-sunday",
    label: "Palm Sunday | April 5, 2026",
    title: "Hosanna with the OTY NYC community",
    image: "/assets/palm-sunday-community.jpeg",
    alt: "OTY NYC community gathered for Palm Sunday",
    details:
      "A Palm Sunday gathering with OTY NYC, clergy, and friends after worship. This moment captures the fellowship and shared Orthodox life the community is building in New York City.",
  },
  {
    id: "fellowship",
    label: "Fellowship",
    title: "Learning, mentorship, and community life",
    image: "/assets/community-gathering.jpeg",
    alt: "OTY NYC community gathering with clergy and young adults",
    details:
      "A teaching and fellowship gathering for young adults to learn, ask questions, and build relationships across parish communities. These gatherings support both spiritual formation and everyday life in the city.",
  },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [selectedBorough, setSelectedBorough] = useState("All");
  const [query, setQuery] = useState("");
  const [today, setToday] = useState(null);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY > 20);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!selectedMoment) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
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
      const section = document.querySelector("[data-scroll-reveal]");
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

  const filteredChurches = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return churches.filter((church) => {
      const inBorough = selectedBorough === "All" || church.borough === selectedBorough;
      const haystack = [
        church.borough,
        church.name,
        church.tradition,
        church.languages,
        church.priest,
        church.transit,
        church.services.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return inBorough && (!cleanQuery || haystack.includes(cleanQuery));
    });
  }, [query, selectedBorough]);

  const cards = useMemo(() => getEventCards(today), [today]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`site-header${headerScrolled || navOpen ? " scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="OTY NYC home">
          <img src="/assets/oty-logo.png" alt="OTY NYC logo" width="64" height="56" />
          <span>
            <strong>OTY NYC</strong>
            <small>Orthodox Tewahedo Youth</small>
          </span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={navOpen}
          aria-controls="site-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
          <span className="sr-only">Open navigation</span>
        </button>

        <nav className={`site-nav${navOpen ? " open" : ""}`} id="site-nav">
          {["Mission", "Current", "Churches", "Calendar", "Fasting Food"].map((label) => (
            <a key={label} href={`#${label === "Fasting Food" ? "fasting" : label.toLowerCase()}`} onClick={() => setNavOpen(false)}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="mailto:contact.otynyc@gmail.com">
            Contact
          </a>
        </nav>
      </header>

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
                <a className="button button-primary" href="#churches">
                  Find a church
                </a>
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
            <a className="text-link" href="#calendar">
              Full 2026 calendar
            </a>
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
          style={{
            "--reveal-progress": revealProgress,
            "--reveal-mask": `${Math.max(0, 18 - revealProgress * 18)}%`,
            "--reveal-scale": 1.07 - revealProgress * 0.07,
            "--icon-scale": 1 + revealProgress * 0.08,
          }}
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

        <section className="section churches-section" id="churches" aria-labelledby="churches-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">NYC Church Guide</p>
              <h2 id="churches-title">Find an Orthodox service near you.</h2>
              <p>
                Search by church, borough, language, priest, or service. Always confirm schedules with the parish
                before traveling.
              </p>
            </div>
          </div>

          <div className="directory-toolbar" aria-label="Church directory controls">
            <label className="search-field">
              <span>Search churches</span>
              <input
                type="search"
                placeholder="Try Bronx, English, Kidan, Vespers..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="filter-buttons" role="list" aria-label="Filter by borough">
              {boroughs.map((borough) => (
                <button
                  className={`filter${selectedBorough === borough ? " active" : ""}`}
                  key={borough}
                  type="button"
                  onClick={() => setSelectedBorough(borough)}
                >
                  {borough}
                </button>
              ))}
            </div>
          </div>

          <div className="church-grid">
            {filteredChurches.map((church) => (
              <ChurchCard church={church} key={church.name} />
            ))}
          </div>
          {filteredChurches.length === 0 && <p className="directory-empty">No churches match that search yet.</p>}
        </section>

        <section className="section calendar-section" id="calendar" aria-labelledby="calendar-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Feasts & Fasting</p>
              <h2 id="calendar-title">2026 Orthodox calendar highlights.</h2>
              <p>Feasts and fasting periods shared with the OTY NYC community.</p>
            </div>
          </div>
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
        </section>

        <section className="section fasting-section" id="fasting" aria-labelledby="fasting-title">
          <div className="fasting-copy">
            <p className="section-kicker">Fasting-Friendly NYC</p>
            <h2 id="fasting-title">Keep the fast without guessing where to eat.</h2>
            <p>
              In the Orthodox Tewahedo Church, fasting trains both body and soul as we draw closer to God. During
              fasting seasons we abstain from animal products, so OTY NYC keeps a vegan and fasting-friendly map for
              church, school, and work days.
            </p>
            <a className="button button-primary" href="https://maps.app.goo.gl/in4X5MmHKXYGYvXk7" target="_blank" rel="noreferrer">
              Open vegan map
            </a>
          </div>
          <div className="fasting-panel">
            <h3>Quick fasting notes</h3>
            <ul>
              <li>Look for vegan meals during fasting seasons.</li>
              <li>Use the map when traveling from church or class.</li>
              <li>Ask OTY NYC to add a reliable spot.</li>
            </ul>
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

      <footer className="site-footer">
        <p>OTY NYC - Orthodox Tewahedo Youth in New York City</p>
        <div>
          <a href="mailto:contact.otynyc@gmail.com">contact.otynyc@gmail.com</a>
          <a href="https://instagram.com/oty.nyc" target="_blank" rel="noreferrer">
            @oty.nyc
          </a>
        </div>
      </footer>

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

function ChurchCard({ church }) {
  const phoneHref = church.phone ? `tel:${church.phone.replace(/[^+\d]/g, "")}` : "";

  return (
    <article className="church-card">
      <header>
        <div>
          <span className="borough-chip">{church.borough}</span>
          <h3>{church.name}</h3>
        </div>
        <span className="type-chip">{church.tradition.includes("Coptic") ? "Coptic" : "EOTC"}</span>
      </header>
      <dl className="church-meta">
        <div>
          <dt>Languages</dt>
          <dd>{church.languages}</dd>
        </div>
        <div>
          <dt>Priest</dt>
          <dd>{church.priest}</dd>
        </div>
        <div>
          <dt>Transit</dt>
          <dd>{church.transit}</dd>
        </div>
        <div>
          <dt>Services</dt>
          <dd>
            {church.services.map((service) => (
              <p key={service}>{service}</p>
            ))}
          </dd>
        </div>
      </dl>
      <div className="link-row">
        {church.website && (
          <a href={church.website} target="_blank" rel="noreferrer">
            Website
          </a>
        )}
        <a href={church.map} target="_blank" rel="noreferrer">
          Map
        </a>
        {church.email && <a href={`mailto:${church.email}`}>Email</a>}
        {phoneHref && <a href={phoneHref}>Call</a>}
      </div>
    </article>
  );
}

function getEventCards(today) {
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

function getStatus(event, today) {
  if (!today) return "Upcoming";

  const start = toDate(event.start);
  const end = toDate(event.end);

  if (today >= start && today <= end) return "Now";
  if (today < start) return "Upcoming";
  return "Past";
}

function formatRange(event) {
  const start = toDate(event.start);
  const end = toDate(event.end);
  const sameDay = start.getTime() === end.getTime();
  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return sameDay ? endText : `${startText}-${endText}`;
}

function toDate(value) {
  return startOfDay(new Date(`${value}T00:00:00`));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
