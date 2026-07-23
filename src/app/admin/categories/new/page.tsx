import { requireRoleOrRedirect } from "@/lib/session";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import CategoryForm from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/categories/new");

  return (
    <DashboardShell
      title="Add Category"
      nav={ADMIN_NAV}
      active="/admin/categories"
      user={session.user}
      backHref="/admin/categories"
    >
      <div className="py-4">
        <CategoryForm />
      </div>
    </DashboardShell>
  );
}
