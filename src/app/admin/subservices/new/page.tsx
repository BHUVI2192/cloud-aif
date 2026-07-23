import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import SubserviceForm from "@/components/admin/SubserviceForm";

export const dynamic = "force-dynamic";

export default async function NewSubservicePage() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/subservices/new");

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <DashboardShell
      title="Add Subservice"
      nav={ADMIN_NAV}
      active="/admin/subservices"
      user={session.user}
      backHref="/admin/subservices"
    >
      <div className="py-4">
        <SubserviceForm categories={categories} />
      </div>
    </DashboardShell>
  );
}
