"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navItems = [
  { label: "Mission", href: "/#mission", activePath: "" },
  { label: "Current", href: "/#current", activePath: "" },
  { label: "Churches", href: "/churches", activePath: "/churches" },
  { label: "Calendar", href: "/calendar", activePath: "/calendar" },
  { label: "Fasting Food", href: "/fasting", activePath: "/fasting" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const solidHeader = pathname !== "/" || headerScrolled || navOpen;

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateHeader = () => setHeaderScrolled(window.scrollY > 20);

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`site-header${solidHeader ? " scrolled" : ""}`}>
        <Link className="brand" href="/" aria-label="OTY NYC home">
          <img src="/assets/oty-logo.png" alt="OTY NYC logo" width="64" height="56" />
          <span>
            <strong>OTY NYC</strong>
            <small>Orthodox Tewahedo Youth</small>
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

        <nav className={`site-nav${navOpen ? " open" : ""}`} id="site-nav">
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
        <div>
          <a href="mailto:contact.otynyc@gmail.com">contact.otynyc@gmail.com</a>
          <a href="https://instagram.com/oty.nyc" target="_blank" rel="noreferrer">
            @oty.nyc
          </a>
        </div>
      </footer>
    </>
  );
}
