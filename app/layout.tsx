import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "./components/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "OTY NYC | Orthodox Tewahedo Youth in New York City",
  description:
    "OTY NYC guides young Orthodox Tewahedo Christians in New York City into deeper faith, fellowship, service, and Orthodox life.",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
