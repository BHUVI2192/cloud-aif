import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminSubservices() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/subservices");
  const subservices = await db.subservice.findMany({
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
    include: { category: true },
  });

  return (
    <DashboardShell title="Subservices" nav={ADMIN_NAV} active="/admin/subservices" user={session.user}>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
            <th className="px-4 py-3 text-left">Subservice</th><th className="text-left">Category</th><th className="px-4 text-left">Active</th>
          </tr></thead>
          <tbody>
            {subservices.map((s) => (
              <tr key={s.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--forest)" }}>{s.name}</td>
                <td style={{ color: "var(--slate)" }}>{s.category.name}</td>
                <td className="px-4"><span className="badge capitalize">{s.isActive ? "active" : "hidden"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
