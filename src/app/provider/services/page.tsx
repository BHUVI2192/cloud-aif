import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderServicesForm from "@/components/ProviderServicesForm";

export const dynamic = "force-dynamic";

export default async function ProviderServices() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/services");
  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subservices: true,
      serviceAreas: true,
      pricing: true,
    },
  });
  if (!provider) return null;

  const [allSubservices, allServiceAreas] = await Promise.all([
    db.subservice.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
    db.serviceArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const initialSubserviceIds = provider.subservices.map((s) => s.subserviceId);
  const initialServiceAreaIds = provider.serviceAreas.map((s) => s.serviceAreaId);
  const initialPricing = provider.pricing.map((p) => ({
    id: p.id,
    label: p.label,
    unit: p.unit,
    amountMin: p.amountMin / 100, // paise to Rs
    amountMax: p.amountMax ? p.amountMax / 100 : null,
    subserviceId: p.subserviceId,
  }));

  return (
    <DashboardShell title="Services & areas" nav={PROVIDER_NAV} active="/provider/services" user={session.user}>
      <ProviderServicesForm
        allSubservices={allSubservices}
        allServiceAreas={allServiceAreas}
        initialSubserviceIds={initialSubserviceIds}
        initialServiceAreaIds={initialServiceAreaIds}
        initialPricing={initialPricing}
      />
    </DashboardShell>
  );
}
