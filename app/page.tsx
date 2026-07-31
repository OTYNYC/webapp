import { GallerySwipe } from "./components/GallerySwipe";
import { HomeCurrentEventsSection } from "./components/HomeCurrentEventsSection";
import { PillarsSection } from "./components/PillarsSection";
import { mission } from "./data";
import {
  fetchUpcomingFeaturedEvents,
  fetchUpcomingFeastsAndFasts,
  hasGoogleCalendarConfig,
  isCalendarUnavailable,
} from "./lib/googleCalendar";
import { loadSiteContent } from "./lib/siteContent";

// No page-level metadata: as the site root this should carry the site title and
// description from the root layout, not a "Home | ..." sub-page override.

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

export default async function Home() {
  // With no calendar connected the whole Current Events section is placeholders, so it is
  // dropped rather than rendered empty. An outage is different: the calendar exists and is
  // temporarily unreachable, so the section stays and says so.
  const calendarConnected = hasGoogleCalendarConfig();

  const [content, featuredResult, feastFastResult] = await Promise.all([
    loadSiteContent(),
    fetchUpcomingFeaturedEvents(),
    fetchUpcomingFeastsAndFasts(),
  ]);

  return (
    <main id="main">
      <GallerySwipe photos={content.galleryPhotos} />

      {calendarConnected && (
        <HomeCurrentEventsSection
          featuredCalendarEvents={featuredResult.events}
          featuredUnavailable={isCalendarUnavailable(featuredResult.error)}
          feastFastItems={feastFastResult.items}
          feastFastUnavailable={isCalendarUnavailable(feastFastResult.error)}
        />
      )}

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
