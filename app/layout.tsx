import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile, SITE_URL } from "@/lib/content";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

const TITLE = `${profile.name} | Marketing, Diseño Web e IA en Zaragoza`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${profile.name}` },
  description: profile.seoDescription,
  applicationName: `${profile.name} · Portfolio`,
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: `${profile.name} · Portfolio`,
    title: TITLE,
    description: profile.seoDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${profile.name}, creativo digital en Zaragoza: marketing, diseño web e IA` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: profile.seoDescription,
    images: ["/og.png"],
  },
  formatDetection: { telephone: false },
  // Google Search Console ownership (keep while the property is verified)
  verification: { google: "M2TKi9GXyz3tIYL4KtbcBFbERjQZ5TQOZhTunSA9sd4" },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`} data-glass="right" suppressHydrationWarning>
      <body className="font-sans">
        {/* without JavaScript, never hide content behind reveal animations */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important;filter:none!important}.line-in{transform:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
