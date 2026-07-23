import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";
import BookProviderDirectory from "@/components/BookProviderDirectory";

export const dynamic = "force-dynamic";

export default async function CustomerBookPage() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    redirect("/login");
  }

  // Fetch approved, active providers
  const providers = await db.providerProfile.findMany({
    where: {
      status: "APPROVED",
      isActive: true,
      deletedAt: null
    },
    include: {
      user: { select: { image: true, phone: true } },
      primaryCategory: { select: { id: true, name: true, slug: true } },
      subservices: {
        include: { subservice: { select: { id: true, name: true } } }
      },
      serviceAreas: {
        include: { serviceArea: { select: { name: true } } }
      }
    },
    orderBy: { ratingAverage: "desc" }
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <DashboardShell
      title="Book a Provider Directly"
      nav={CUSTOMER_NAV}
      active="/customer/book"
      user={session.user}
      backHref="/customer"
    >
      <BookProviderDirectory
        providers={providers.map((p) => ({
          id: p.id,
          displayName: p.displayName,
          headline: p.headline || "",
          bio: p.bio || "",
          experienceYears: p.experienceYears,
          profileImage: p.profileImage || p.user.image || "",
          ratingAverage: p.ratingAverage,
          ratingCount: p.ratingCount,
          jobsCompleted: p.jobsCompleted,
          primaryCategoryName: p.primaryCategory?.name || "",
          primaryCategorySlug: p.primaryCategory?.slug || "",
          subservices: p.subservices.map((s) => s.subservice.name),
          localities: p.serviceAreas.map((sa) => sa.serviceArea.name),
        }))}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug
        }))}
      />
    </DashboardShell>
  );
}
