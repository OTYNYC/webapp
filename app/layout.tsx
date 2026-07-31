import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Raleway } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "./components/SiteShell";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-raleway",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

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
      <body className={`${raleway.variable} ${cormorantGaramond.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
