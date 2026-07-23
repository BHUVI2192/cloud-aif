import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/categories");
  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subservices: true, serviceRequests: true } } },
  });

  return (
    <DashboardShell title="Categories" nav={ADMIN_NAV} active="/admin/categories" user={session.user}>
      <AdminCategoriesClient initialCategories={categories} />
    </DashboardShell>
  );
}
