import type { Metadata } from "next";
import { Syne, Outfit, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: {
    default: "Franley | Premium Luxury Silk Ties & Gentlemen Accessories",
    template: "%s | Franley",
  },
  description: "Elevate your sartorial elegance with Franley's premium menswear and luxury accessories. Discover handcrafted mulberry silk ties, designer cufflinks, and classic pocket squares curated for the modern gentleman.",
  keywords: [
    "luxury silk ties",
    "handcrafted cufflinks",
    "menswear accessories",
    "sartorial style",
    "franley",
    "colombo weddings",
    "formal dress codes",
    "pocket squares",
    "men's fashion sri lanka",
    "gentlemen accessories",
    "ARC AI",
    "ArcAI",
    "AI Automation",
    "Software Company"
  ],
  authors: [
    { name: "Franley Team", url: "https://www.franley.lk" },
    { name: "ARC AI", url: "https://www.arcai.agency" }
  ],
  creator: "ARC AI",
  publisher: "Franley",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Franley | Premium Luxury Silk Ties & Gentlemen Accessories",
    description: "Elevate your sartorial elegance with Franley's premium handcrafted ties and cufflinks. Crafted for the modern gentleman.",
    url: "https://www.franley.lk",
    siteName: "Franley",
    images: [
      {
        url: "/banner_1.webp",
        width: 1024,
        height: 1024,
        alt: "Franley Premium Gentlemen Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Franley | Premium Luxury Silk Ties & Gentlemen Accessories",
    description: "Elevate your sartorial elegance with Franley's premium handcrafted ties and cufflinks.",
    images: ["/banner_1.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

import AnalyticsTracker from "../components/AnalyticsTracker";
import StickyNavbar from "../components/StickyNavbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${outfit.variable} ${inter.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-outfit text-zinc-900">
        <AnalyticsTracker />
        <div>
          <StickyNavbar />
        </div>
        {children}
      </body>
    </html>
  );
}
