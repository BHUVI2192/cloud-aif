import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/categories");
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subservices: true, serviceRequests: true } } },
  });

  return (
    <DashboardShell title="Categories" nav={ADMIN_NAV} active="/admin/categories" user={session.user}>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
            <th className="px-4 py-3 text-left">Name</th><th className="text-left">Slug</th><th className="text-left">Subservices</th><th className="text-left">Requests</th><th className="px-4 text-left">Active</th>
          </tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--forest)" }}>{c.name}</td>
                <td style={{ color: "var(--slate)" }}>{c.slug}</td>
                <td style={{ color: "var(--slate)" }}>{c._count.subservices}</td>
                <td style={{ color: "var(--slate)" }}>{c._count.serviceRequests}</td>
                <td className="px-4"><span className="badge capitalize">{c.isActive ? "active" : "hidden"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12px]" style={{ color: "var(--slate)" }}>Create/edit handlers connect to admin routes; taxonomy is seed-driven in this build.</p>
    </DashboardShell>
  );
}
