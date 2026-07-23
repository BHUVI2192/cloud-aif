import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import SubserviceForm from "@/components/admin/SubserviceForm";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditSubservicePage({ params }: Props) {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], `/admin/subservices/${params.id}/edit`);

  const subservice = await db.subservice.findUnique({
    where: { id: params.id, deletedAt: null },
  });

  if (!subservice) {
    notFound();
  }

  const categories = await db.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <DashboardShell
      title={`Edit ${subservice.name}`}
      nav={ADMIN_NAV}
      active="/admin/subservices"
      user={session.user}
      backHref="/admin/subservices"
    >
      <div className="py-4">
        <SubserviceForm subservice={subservice} categories={categories} />
      </div>
    </DashboardShell>
  );
}
