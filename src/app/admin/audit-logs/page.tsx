import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogs() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/audit-logs");
  const logs = await db.adminActionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: true },
  });

  return (
    <DashboardShell title="Audit logs" nav={ADMIN_NAV} active="/admin/audit-logs" user={session.user}>
      {logs.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>No admin actions logged yet. Approve or reject a provider to see entries here.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-[14px]">
            <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
              <th className="px-4 py-3 text-left">Action</th><th className="text-left">Target</th><th className="text-left">Actor</th><th className="px-4 text-left">When</th>
            </tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3 capitalize" style={{ color: "var(--forest)" }}>{l.action.replace(/_/g, " ").toLowerCase()}</td>
                  <td style={{ color: "var(--slate)" }}>{l.targetEntityType}</td>
                  <td style={{ color: "var(--slate)" }}>{l.actor.name ?? l.actor.email}</td>
                  <td className="px-4" style={{ color: "var(--slate)" }}>{l.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
