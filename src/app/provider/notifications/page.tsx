import { requireRoleOrRedirect } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import NotificationsList from "@/components/NotificationsList";

export const dynamic = "force-dynamic";

export default async function ProviderNotificationsPage() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/notifications");

  return (
    <DashboardShell
      title="Notifications"
      nav={PROVIDER_NAV}
      active="/provider"
      user={session.user}
      backHref="/provider"
    >
      <div className="max-w-[720px] mx-auto py-4">
        <NotificationsList />
      </div>
    </DashboardShell>
  );
}
