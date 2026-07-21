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

// Cache provider slot availability calculation for 60 seconds per provider per date
export async function getCachedProviderSlots(providerId: string, dateStr: string, dayOfWeekName: any) {
  return unstable_cache(
    async () => {
      const [provider, availability] = await Promise.all([
        db.providerProfile.findUnique({
          where: { id: providerId },
          select: { id: true },
        }),
        db.providerAvailability.findFirst({
          where: {
            providerId,
            type: "WEEKLY_RECURRING",
            dayOfWeek: dayOfWeekName,
          },
          select: { startTime: true, endTime: true, isAvailable: true },
        }),
      ]);

      if (!provider) return { error: "NOT_FOUND" as const };
      if (availability && !availability.isAvailable) return { data: { isAvailable: false, slots: [] } };

      let startTime = "09:00";
      let endTime = "17:00";
      if (availability) {
        startTime = availability.startTime;
        endTime = availability.endTime;
      }

      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAssignments = await db.providerAssignment.findMany({
        where: {
          providerId,
          status: { in: ["ACCEPTED", "PENDING", "COMPLETED"] },
          request: {
            preferredDate: { gte: startOfDay, lte: endOfDay },
            deletedAt: null,
          },
        },
        select: { request: { select: { preferredTime: true } } },
      });

      const [startH] = startTime.split(":").map(Number);
      const [endH] = endTime.split(":").map(Number);

      const slots: { slot: string; isBooked: boolean }[] = [];
      let currentHour = startH;

      while (currentHour + 2 <= endH) {
        const nextHour = currentHour + 2;
        const formatTime = (h: number) => `${h.toString().padStart(2, "0")}:00`;
        const slotStr = `${formatTime(currentHour)} - ${formatTime(nextHour)}`;

        const isBooked = existingAssignments.some((assign) => {
          const timeVal = assign.request.preferredTime;
          if (!timeVal) return false;
          return timeVal.includes(slotStr) || slotStr.includes(timeVal);
        });

        slots.push({ slot: slotStr, isBooked });
        currentHour = nextHour;
      }

      return { data: { isAvailable: true, slots } };
    },
    [`provider-slots-${providerId}-${dateStr}`],
    { revalidate: 60, tags: [`slots-${providerId}`] }
  )();
}
