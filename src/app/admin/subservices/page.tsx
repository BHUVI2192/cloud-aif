import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import AdminSubservicesClient from "@/components/admin/AdminSubservicesClient";

export const dynamic = "force-dynamic";

export default async function AdminSubservices() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/subservices");
  
  const subservices = await db.subservice.findMany({
    where: { deletedAt: null },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { category: true },
  });

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <DashboardShell title="Subservices" nav={ADMIN_NAV} active="/admin/subservices" user={session.user}>
      <AdminSubservicesClient initialSubservices={subservices} categories={categories} />
    </DashboardShell>
  );
}
