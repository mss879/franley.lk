import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS } from "./products";
import HomeClient from "./HomeClient";

async function getProducts() {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: `Rs. ${Math.round(item.price).toLocaleString()}`,
          slashedPrice: item.slashed_price ? `Rs. ${Math.round(item.slashed_price).toLocaleString()}` : "",
          discount: item.discount || "",
          description: item.description,
          color: item.color || "burgundy",
          metaTitle: item.meta_title || ""
        }));
      }
    }
  } catch (e) {
    console.warn("Failed to fetch products on server:", e);
  }
  
  // Return local mock products without icon elements
  return MOCK_PRODUCTS.map(({ icon, ...p }) => p);
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Franley",
  "url": "https://www.franley.lk",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.franley.lk/shop?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "creator": {
    "@type": "Organization",
    "name": "ARC AI",
    "url": "https://www.arcai.agency",
    "description": "AI Automation and Software Company"
  }
};

const storeSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Franley",
  "url": "https://www.franley.lk",
  "logo": "https://www.franley.lk/franley_logo_no_text_transparent.png",
  "image": "https://www.franley.lk/banner_1.webp",
  "description": "Elevate your sartorial elegance with Franley's premium menswear and luxury accessories. Discover handcrafted mulberry silk ties, designer cufflinks, and classic pocket squares curated for the modern gentleman.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "LK"
  },
  "priceRange": "$$",
  "creator": {
    "@type": "Organization",
    "name": "ARC AI",
    "url": "https://www.arcai.agency",
    "description": "AI Automation and Software Company"
  }
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.franley.lk"),
  title: "Franley | Premium Luxury Silk Ties & Gentlemen Accessories",
  description: "Elevate your sartorial elegance with Franley's premium menswear and luxury accessories. Discover handcrafted mulberry silk ties, designer cufflinks, and classic pocket squares curated for the modern gentleman.",
};

export default async function Page() {
  const products = await getProducts();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <HomeClient initialProducts={products as any} />
    </>
  );
}
