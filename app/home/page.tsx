import type { Metadata } from "next";
import { GallerySwipe } from "../components/GallerySwipe";
import { HomeCurrentEventsSection } from "../components/HomeCurrentEventsSection";
import { PillarsSection } from "../components/PillarsSection";
import { mission } from "../data";
import { fetchUpcomingFeaturedEvents, fetchUpcomingFeastsAndFasts } from "../lib/googleCalendar";
import { loadSiteContent } from "../lib/siteContent";

export const metadata: Metadata = {
  title: "Home | OTY NYC",
  description: "Faith, fellowship, and Orthodox life in NYC - OTY NYC's photo gallery and mission.",
};

export const dynamic = "force-dynamic";

const MISSION_HEADING_HIGHLIGHTS = ["Rooted in", "faith", "for", "life"];
const MISSION_HEADING_HIGHLIGHT_PATTERN = new RegExp(
  `\\b(${MISSION_HEADING_HIGHLIGHTS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

function renderMissionHeading(text: string) {
  return text
    .split(MISSION_HEADING_HIGHLIGHT_PATTERN)
    .map((part, index) => (index % 2 === 1 ? <span className="text-accent-gold" key={index}>{part}</span> : part));
}

export default async function HomeGalleryPage() {
  const [content, featuredResult, feastFastResult] = await Promise.all([
    loadSiteContent(),
    fetchUpcomingFeaturedEvents(),
    fetchUpcomingFeastsAndFasts(),
  ]);

  return (
    <main id="main">
      <GallerySwipe photos={content.galleryPhotos} />

      <HomeCurrentEventsSection featuredCalendarEvents={featuredResult.events} feastFastItems={feastFastResult.items} />

      <section className="section mission-section home-mission-section" id="mission" aria-labelledby="mission-title">
        <div className="mission-copy">
          <p className="section-kicker">{mission.kicker}</p>
          <h2 id="mission-title">{renderMissionHeading(mission.heading)}</h2>
          {mission.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mission-card testimonial-card" aria-label="OTY NYC member testimony">
          <blockquote className="testimonial">
            <span className="testimonial-mark testimonial-mark-open" aria-hidden="true">
              &ldquo;
            </span>
            <p>
              As someone who recently moved to New York, OTY NYC has been a blessing. I had no expectations of
              finding a community, let alone one with the purpose of seeking to grow in the knowledge and love of
              Christ. OTY NYC has been serving me in every way.
            </p>
            <span className="testimonial-mark testimonial-mark-close" aria-hidden="true">
              &rdquo;
            </span>
          </blockquote>
          <cite className="testimonial-attribution">OTY NYC Member</cite>
        </div>
      </section>

      <PillarsSection />
    </main>
  );
}
