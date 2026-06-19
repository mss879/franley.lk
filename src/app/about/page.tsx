import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "About Us | Curated Electronics & Lifestyle Store | Franley",
  description: "Franley is a curated online store for electronics and lifestyle products in Sri Lanka — handpicked tech, workspace gear and accessories, fairly priced and delivered to your door.",
  openGraph: {
    title: "About Us | Curated Electronics & Lifestyle Store | Franley",
    description: "A curated online store for electronics and lifestyle products in Sri Lanka — handpicked, fairly priced, and delivered to your door.",
    url: "https://www.franley.lk/about",
    images: ["/banner_1.webp"],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
