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
    include: { complainant: true, provider: true, request: true },
  });

  const now = new Date().getTime();

  return (
    <DashboardShell title="Dispute & SLA Resolution Console" nav={ADMIN_NAV} active="/admin/complaints" user={session.user}>
      {complaints.length === 0 ? (
        <div className="card text-[15px]" style={{ color: "var(--slate)" }}>No complaints filed.</div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
                <th className="px-4 py-3 text-left">Subject & Details</th>
                <th className="text-left">Type</th>
                <th className="text-left">Priority</th>
                <th className="text-left">Status</th>
                <th className="text-left">SLA Timer</th>
                <th className="px-4 text-left">Complainant</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => {
                const createdMs = new Date(c.createdAt).getTime();
                const ageHours = (now - createdMs) / (1000 * 60 * 60);
                const isSlaBreached = c.status === "OPEN" && ageHours > 2;

                return (
                  <tr key={c.id} className={`border-t ${isSlaBreached ? "bg-rose-50/70" : ""}`} style={{ borderColor: "var(--line)" }}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{c.subject}</div>
                      <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{c.description}</div>
                    </td>
                    <td className="capitalize font-semibold text-slate-700">{c.type.replace(/_/g, " ").toLowerCase()}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.priority === "HIGH" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "OPEN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === "OPEN" ? (
                        <span className={`font-mono font-bold text-[10px] ${isSlaBreached ? "text-rose-700 animate-pulse" : "text-emerald-700"}`}>
                          {isSlaBreached ? `🚨 SLA Breached (${ageHours.toFixed(1)}h)` : `⏱️ ${ageHours.toFixed(1)}h / 2.0h SLA`}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Resolved</span>
                      )}
                    </td>
                    <td className="px-4 text-slate-700 font-medium">
                      {c.complainant.name ?? c.complainant.email}
                      {c.provider && <span className="block text-[10px] text-slate-400">vs {c.provider.displayName}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
