import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS } from "./products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.franley.lk";

  // Base static pages
  const routes = [
    "",
    "/shop",
    "/cart",
    "/contact",
    "/privacy-policy",
    "/refund-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic product pages
  let products = MOCK_PRODUCTS;
  try {
    if (supabase) {
      const { data, error } = await supabase.from("products").select("id");
      if (!error && data && data.length > 0) {
        products = data as any[];
      }
    }
  } catch (e) {
    console.warn("Sitemap failed to fetch products from Supabase, using mock products:", e);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes];
}
