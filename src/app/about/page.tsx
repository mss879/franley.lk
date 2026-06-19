import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "About Us | Premium Men's Accessories Brand | Franley",
  description: "FRANLEY is a Sri Lankan men’s accessories brand built for the modern gentleman, focusing on timeless essentials—handcrafted silk neckties, bespoke cufflinks, belts, wallets, and premium gift sets.",
  openGraph: {
    title: "About Us | Premium Men's Accessories Brand | Franley",
    description: "Franley is a Sri Lankan men’s accessories brand built for the modern gentleman. We focus on timeless essentials—neckties, cufflinks, belts, wallets and more—designed to elevate your everyday style.",
    url: "https://www.franley.lk/about",
    images: ["/banner_1.webp"],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
