import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/login", "/checkout"],
    },
    sitemap: "https://www.franley.lk/sitemap.xml",
  };
}
