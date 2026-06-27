import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminComplaints() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/complaints");
  const complaints = await db.complaint.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: { complainant: true, provider: true },
  });

  return (
    <DashboardShell title="Complaints" nav={ADMIN_NAV} active="/admin/complaints" user={session.user}>
      {complaints.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>No complaints filed.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-[14px]">
            <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
              <th className="px-4 py-3 text-left">Subject</th><th className="text-left">Type</th><th className="text-left">Priority</th><th className="text-left">Status</th><th className="px-4 text-left">From</th>
            </tr></thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--forest)" }}>{c.subject}</td>
                  <td className="capitalize" style={{ color: "var(--slate)" }}>{c.type.replace(/_/g, " ").toLowerCase()}</td>
                  <td><span className="badge capitalize">{c.priority.toLowerCase()}</span></td>
                  <td className="capitalize" style={{ color: "var(--slate)" }}>{c.status.replace(/_/g, " ").toLowerCase()}</td>
                  <td className="px-4" style={{ color: "var(--slate)" }}>{c.complainant.name ?? c.complainant.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
