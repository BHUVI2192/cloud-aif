import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import ProviderPortfolioManager from "@/components/ProviderPortfolioManager";

export const dynamic = "force-dynamic";

export default async function ProviderPortfolio() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/portfolio");
  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { portfolio: { orderBy: { sortOrder: "asc" } } },
  });
  if (!provider) return null;

  return (
    <DashboardShell title="Portfolio" nav={PROVIDER_NAV} active="/provider/portfolio" user={session.user}>
      <ProviderPortfolioManager initialItems={provider.portfolio} />
    </DashboardShell>
  );
}
