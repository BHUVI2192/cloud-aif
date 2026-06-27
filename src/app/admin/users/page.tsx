import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/users");
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <DashboardShell title="Users" nav={ADMIN_NAV} active="/admin/users" user={session.user}>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
            <th className="px-4 py-3 text-left">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="px-4 text-left">Status</th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3 font-semibold" style={{ color: "var(--forest)" }}>{u.name ?? "—"}</td>
                <td style={{ color: "var(--slate)" }}>{u.email}</td>
                <td className="capitalize" style={{ color: "var(--slate)" }}>{u.role.replace(/_/g, " ").toLowerCase()}</td>
                <td className="px-4"><span className="badge capitalize">{u.status.toLowerCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
