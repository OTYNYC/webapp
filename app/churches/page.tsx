import type { Metadata } from "next";
import { ChurchDirectory } from "../components/ChurchDirectory";

export const metadata: Metadata = {
  title: "Church Guide | OTY NYC",
  description: "Find Orthodox Tewahedo and Coptic Orthodox services across New York City.",
};

export default function ChurchesPage() {
  return (
    <main className="subpage-main" id="main">
      <section className="page-hero" aria-labelledby="churches-title">
        <div>
          <p className="section-kicker">NYC Church Guide</p>
          <h1 id="churches-title">Find an Orthodox service near you.</h1>
          <p>
            Search by church, borough, language, priest, or service. Always confirm schedules with the parish before
            traveling.
          </p>
        </div>
      </section>

      <section className="section route-section" aria-label="Church directory">
        <ChurchDirectory />
      </section>
    </main>
  );
}
