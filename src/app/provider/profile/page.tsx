import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderProfileForm from "@/components/ProviderProfileForm";

export const dynamic = "force-dynamic";

export default async function ProviderProfilePage() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/profile");
  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!provider) {
    return (
      <DashboardShell title="Profile" nav={PROVIDER_NAV} active="/provider/profile" user={session.user}>
        <div className="card">No profile found.</div>
      </DashboardShell>
    );
  }

  const categories = await db.category.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <DashboardShell title="Profile" nav={PROVIDER_NAV} active="/provider/profile" user={session.user}>
      <ProviderProfileForm 
        profile={provider} 
        categories={categories} 
        initialPhone={provider.user.phone ?? ""} 
      />
    </DashboardShell>
  );
}
