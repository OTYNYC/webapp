import type { Metadata } from "next";
import { CalendarHighlights } from "../components/CalendarHighlights";

export const metadata: Metadata = {
  title: "Calendar | OTY NYC",
  description: "Follow 2026 Orthodox feast and fasting highlights with OTY NYC.",
};

export default function CalendarPage() {
  return (
    <main className="subpage-main" id="main">
      <section className="page-hero" aria-labelledby="calendar-title">
        <div>
          <p className="section-kicker">Feasts &amp; Fasting</p>
          <h1 id="calendar-title">2026 Orthodox calendar highlights.</h1>
          <p>Feasts and fasting periods shared with the OTY NYC community.</p>
        </div>
      </section>

      <section className="section route-section" aria-label="Calendar highlights">
        <CalendarHighlights />
      </section>
    </main>
  );
}
