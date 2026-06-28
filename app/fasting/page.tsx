import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fasting Food | OTY NYC",
  description: "Open OTY NYC's fasting-friendly vegan map for New York City.",
};

export default function FastingPage() {
  return (
    <main className="subpage-main" id="main">
      <section className="page-hero" aria-labelledby="fasting-title">
        <div>
          <p className="section-kicker">Fasting-Friendly NYC</p>
          <h1 id="fasting-title">Keep the fast without guessing where to eat.</h1>
          <p>
            In the Orthodox Tewahedo Church, fasting trains both body and soul as we draw closer to God. During fasting
            seasons we abstain from animal products, so OTY NYC keeps a vegan and fasting-friendly map for church,
            school, and work days.
          </p>
        </div>
      </section>

      <section className="section fasting-section route-section" aria-label="Fasting food guide">
        <div className="fasting-copy">
          <p className="section-kicker">NYC Map</p>
          <h2>Fasting-friendly food nearby.</h2>
          <p>Use the shared map when traveling from church, class, or work during fasting seasons.</p>
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
    </main>
  );
}
