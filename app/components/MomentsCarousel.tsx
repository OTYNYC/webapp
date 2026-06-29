"use client";

import { useRef, useState } from "react";
import type { Moment } from "../data";

interface MomentsCarouselProps {
  moments: Moment[];
  onSelect: (moment: Moment) => void;
}

export function MomentsCarousel({ moments, onSelect }: MomentsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), moments.length - 1);
    const slide = trackRef.current?.children.item(nextIndex);

    setActiveIndex(nextIndex);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const updateActiveSlide = () => {
    const track = trackRef.current;
    if (!track) return;

    const trackLeft = track.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    Array.from(track.children).forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  if (moments.length === 0) {
    return <p className="moments-empty">Community moments will appear here as gatherings are added.</p>;
  }

  return (
    <div className="moments-carousel" aria-roledescription="carousel" aria-label="Community moments">
      <div className="carousel-controls">
        <button type="button" aria-label="Previous community moment" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}>
          &lt;
        </button>
        <button
          type="button"
          aria-label="Next community moment"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === moments.length - 1}
        >
          &gt;
        </button>
      </div>

      <div className="moments-track" ref={trackRef} onScroll={updateActiveSlide}>
        {moments.map((moment, index) => (
          <article className="moment-slide" key={moment.id} aria-roledescription="slide" aria-label={`${index + 1} of ${moments.length}`}>
            <button className="moment-card" type="button" onClick={() => onSelect(moment)}>
              <img src={moment.image} alt={moment.alt} width="4032" height="3024" loading="lazy" />
              <div>
                <span>{moment.label}</span>
                <h3>{moment.title}</h3>
                <small>View details</small>
              </div>
            </button>
          </article>
        ))}
      </div>

      {moments.length > 1 && (
        <div className="carousel-dots" aria-label="Choose community moment">
          {moments.map((moment, index) => (
            <button
              className={index === activeIndex ? "active" : undefined}
              type="button"
              key={moment.id}
              aria-label={`Show ${moment.title}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
