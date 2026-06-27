import { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * Dynamic Sitemap Generator
 * Automatically maps static pages and database categories for local SEO indexation.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://cloudaif.in";

  // Static site paths
  const staticPaths = [
    "",
    "/how-it-works",
    "/become-a-provider",
    "/faq",
    "/support",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamic category landing page paths for local search (e.g. /services/plumber)
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categoryPaths = categories.map((cat) => ({
      url: `${baseUrl}/services/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticPaths, ...categoryPaths];
  } catch (err) {
    console.error("[seo-sitemap] Failed to fetch dynamic categories for sitemap, fallback to static only:", err);
    return staticPaths;
  }
}
