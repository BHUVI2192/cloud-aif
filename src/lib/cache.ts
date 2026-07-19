import { unstable_cache } from "next/cache";
import { db } from "./db";

// Cache categories list for 5 minutes (300 seconds)
export const getCachedCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        subservices: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["categories-list"],
  { revalidate: 300, tags: ["categories"] }
);

// Cache category detail by slug for 5 minutes
export const getCachedCategory = unstable_cache(
  async (slug: string) => {
    return db.category.findUnique({
      where: { slug },
      include: {
        subservices: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["category-detail"],
  { revalidate: 300, tags: ["categories"] }
);

// Cache subservice detail by category and subservice slugs for 5 minutes
export const getCachedSubservice = unstable_cache(
  async (categorySlug: string, subserviceSlug: string) => {
    const category = await db.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return null;
    return db.subservice.findFirst({
      where: { categoryId: category.id, slug: subserviceSlug, isActive: true },
    });
  },
  ["subservice-detail"],
  { revalidate: 300, tags: ["subservices"] }
);



// Cache all active service areas for 10 minutes
export const getCachedAllServiceAreas = unstable_cache(
  async () => {
    return db.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    });
  },
  ["all-service-areas"],
  { revalidate: 600, tags: ["service-areas"] }
);

// Cache top approved providers in a category for 3 minutes (180 seconds)
export const getCachedProvidersForCategory = unstable_cache(
  async (categoryId: string) => {
    return db.providerProfile.findMany({
      where: {
        status: "APPROVED",
        isActive: true,
        deletedAt: null,
        primaryCategoryId: categoryId,
      },
      orderBy: { ratingAverage: "desc" },
      take: 6,
    });
  },
  ["category-providers"],
  { revalidate: 180, tags: ["providers"] }
);

// Cache active FAQs for 10 minutes
export const getCachedFaqs = unstable_cache(
  async () => {
    return db.fAQ.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  },
  ["faq-list"],
  { revalidate: 600, tags: ["faq"] }
);
