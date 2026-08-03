"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryPhoto } from "../data";
import { ChevronIcon } from "./ChevronIcon";

const AUTO_ADVANCE_MS = 5000;

export function GallerySwipe({ photos }: { photos: GalleryPhoto[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    const nextIndex = ((index % photos.length) + photos.length) % photos.length;
    const track = trackRef.current;
    const slide = track?.children.item(nextIndex);

    setActiveIndex(nextIndex);

    if (track && slide instanceof HTMLElement) {
      track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (photos.length <= 1) return undefined;

    const timer = setTimeout(() => goTo(activeIndex + 1), AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;

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

  return (
    <section className="gallery-swipe" aria-roledescription="carousel" aria-label="OTY NYC photo gallery">
      <div className="gallery-swipe-track" ref={trackRef} onScroll={updateActiveSlide}>
        {photos.map((photo, index) => (
          <figure className="gallery-swipe-slide" key={photo.id} aria-roledescription="slide" aria-label={`${index + 1} of ${photos.length}`}>
            <img
              className="gallery-swipe-backdrop"
              src={photo.src}
              alt=""
              aria-hidden="true"
              loading={index === 0 ? "eager" : "lazy"}
            />
            <img
              className="gallery-swipe-photo"
              src={photo.src}
              alt={photo.alt}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </figure>
        ))}
      </div>

      <div className="gallery-swipe-overlay">
        <img className="gallery-swipe-logo" src="/assets/oty-logo.png" alt="" width="154" height="136" />
        <div className="gallery-swipe-copy">
          <h1 className="gallery-swipe-title">
            <span className="gallery-swipe-title-line gallery-swipe-title-line-1">Guiding young</span>
            <span className="gallery-swipe-title-line gallery-swipe-title-line-2">Orthodox Tewahedo Christians</span>
            <span className="gallery-swipe-title-line gallery-swipe-title-line-3">
              in NYC to <span className="gallery-swipe-title-accent">live</span> and{" "}
              <span className="gallery-swipe-title-accent">grow</span> in authentic faith
            </span>
          </h1>
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <div className="gallery-swipe-controls">
            <button type="button" aria-label="Previous photo" onClick={() => goTo(activeIndex - 1)} disabled={activeIndex === 0}>
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === photos.length - 1}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>

          <div className="gallery-swipe-dots" aria-label="Choose photo">
            {photos.map((photo, index) => (
              <button
                className={index === activeIndex ? "active" : undefined}
                type="button"
                key={photo.id}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
