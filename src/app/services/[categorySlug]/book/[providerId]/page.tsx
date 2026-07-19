import { getSession } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";
import ProviderBookingClient from "@/components/ProviderBookingClient";

export const dynamic = "force-dynamic";

export default async function BookProviderPage({
  params,
}: {
  params: { categorySlug: string; providerId: string };
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/services/${params.categorySlug}/book/${params.providerId}`);
  }

  const category = await db.category.findUnique({
    where: { slug: params.categorySlug },
    include: { subservices: { where: { isActive: true } } },
  });

  const provider = await db.providerProfile.findUnique({
    where: { id: params.providerId },
    include: { user: true },
  });

  if (!category || !provider) {
    notFound();
  }

  const areas = await db.serviceArea.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <DashboardShell
      title={`Book ${provider.displayName}`}
      nav={CUSTOMER_NAV}
      active="/services"
      user={session.user}
    >
      <div className="max-w-[760px] mx-auto py-4">
        <ProviderBookingClient
          category={category}
          provider={provider}
          areas={areas}
        />
      </div>
    </DashboardShell>
  );
}
