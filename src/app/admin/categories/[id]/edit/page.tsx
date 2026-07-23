import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import CategoryForm from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], `/admin/categories/${params.id}/edit`);

  const category = await db.category.findUnique({
    where: { id: params.id, deletedAt: null },
  });

  if (!category) {
    notFound();
  }

  return (
    <DashboardShell
      title={`Edit ${category.name}`}
      nav={ADMIN_NAV}
      active="/admin/categories"
      user={session.user}
      backHref="/admin/categories"
    >
      <div className="py-4">
        <CategoryForm category={category} />
      </div>
    </DashboardShell>
  );
}
