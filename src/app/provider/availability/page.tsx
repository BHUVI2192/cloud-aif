import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderAvailabilityForm from "@/components/ProviderAvailabilityForm";

export const dynamic = "force-dynamic";

export default async function ProviderAvailability() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/availability");
  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { availability: true },
  });
  if (!provider) return null;

  return (
    <DashboardShell title="Availability" nav={PROVIDER_NAV} active="/provider/availability" user={session.user}>
      <ProviderAvailabilityForm initialSlots={provider.availability} />
    </DashboardShell>
  );
}
