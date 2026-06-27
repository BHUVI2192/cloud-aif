import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import AdminSettingsForm from "@/components/AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/settings");
  const settings = await db.platformSetting.findMany({ orderBy: { group: "asc" } });

  return (
    <DashboardShell title="Platform settings" nav={ADMIN_NAV} active="/admin/settings" user={session.user}>
      <AdminSettingsForm initialSettings={settings} />
    </DashboardShell>
  );
}
