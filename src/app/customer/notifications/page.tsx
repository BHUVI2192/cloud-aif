import { requireRoleOrRedirect } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { CUSTOMER_NAV } from "@/lib/nav";
import NotificationsList from "@/components/NotificationsList";

export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage() {
  const session = await requireRoleOrRedirect(["CUSTOMER"], "/customer/notifications");

  return (
    <DashboardShell
      title="Notifications"
      nav={CUSTOMER_NAV}
      active="/customer"
      user={session.user}
      backHref="/customer"
    >
      <div className="max-w-[720px] mx-auto py-4">
        <NotificationsList />
      </div>
    </DashboardShell>
  );
}
