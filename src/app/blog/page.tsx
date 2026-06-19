import { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Sartorial Journal | Style Insights & Gentlemen Guides | Franley",
  description: "Read the Franley Style Journal. Expert insights on silk necktie weaves, cufflink pairing rules, and luxury gentlemen style guide in Sri Lanka.",
  openGraph: {
    title: "Sartorial Journal | Style Insights & Gentlemen Guides | Franley",
    description: "Read the Franley Style Journal. Style guides, tie-knot selection, and matching luxury accessories in Sri Lanka.",
    url: "https://www.franley.lk/blog",
    images: ["/banner_1.webp"],
  },
};

export default function Page() {
  return <BlogClient />;
}
