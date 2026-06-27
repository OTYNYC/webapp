import "./globals.css";

export const metadata = {
  title: "OTY NYC | Orthodox Tewahedo Youth in New York City",
  description:
    "OTY NYC guides young Orthodox Tewahedo Christians in New York City into deeper faith, fellowship, service, and Orthodox life.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
