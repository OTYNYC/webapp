"use client";

import { useMemo, useState } from "react";
import { boroughs, churches, type Church } from "../data";

export function ChurchDirectory() {
  const [selectedBorough, setSelectedBorough] = useState("All");
  const [query, setQuery] = useState("");

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

  return (
    <>
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
    </>
  );
}

function ChurchCard({ church }: { church: Church }) {
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
