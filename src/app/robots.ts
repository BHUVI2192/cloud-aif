import { MetadataRoute } from "next";

/**
 * Robots.txt configuration
 * Directs search spiders to crawl public routes while excluding private user/admin dashboards.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://cloudaif.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/adminlogin/",
        "/provider/",
        "/customer/",
        "/api/",
        "/_next/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
