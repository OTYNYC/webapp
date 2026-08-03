"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { InstagramIcon, MailIcon } from "./QuickInfoIcons";

const navItems = [
  { label: "Home", href: "/", activePath: "/" },
  { label: "Current", href: "/#current", activePath: "" },
  { label: "Church Directory", href: "/churches", activePath: "/churches" },
  { label: "Calendar", href: "/calendar", activePath: "/calendar" },
  { label: "Resources", href: "/fasting", activePath: "/fasting" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === "/";
  const solidHeader = !isHome || navOpen || isScrolled;

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!navOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNavOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [navOpen]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`site-header${solidHeader ? " scrolled" : ""}${isHome ? " header-transparent" : ""}`}>
        <Link className="home-brand" href="/" aria-label="OTY NYC home">
          <img className="home-brand-mark" src="/assets/oty-logo-mark.png" alt="OTY NYC" width="515" height="322" />
          <span className="home-brand-text">
            <span className="home-brand-text-full">Orthodox Tewahedo Youth in New York City</span>
            <span className="home-brand-text-short">OTY NYC</span>
          </span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={navOpen}
          aria-controls="site-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav${navOpen ? " open" : ""}`} id="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = Boolean(item.activePath) && pathname === item.activePath;

            return (
              <Link
                className={isActive ? "active" : undefined}
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <a className="nav-cta" href="mailto:contact.otynyc@gmail.com" onClick={() => setNavOpen(false)}>
            Contact
          </a>
        </nav>
      </header>

      {children}

      <footer className="site-footer">
        <p>OTY NYC - Orthodox Tewahedo Youth in New York City</p>
        <div className="footer-actions">
          <a
            className="footer-button footer-button-email"
            href="mailto:contact.otynyc@gmail.com"
            aria-label="Email OTY NYC"
          >
            <MailIcon />
          </a>
          <a
            className="footer-button footer-button-follow"
            href="https://instagram.com/oty.nyc"
            target="_blank"
            rel="noreferrer"
            aria-label="Follow OTY NYC on Instagram"
          >
            <InstagramIcon />
          </a>
        </div>
      </footer>
    </>
  );
}
