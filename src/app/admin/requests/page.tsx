import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminRequests() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/requests");
  const requests = await db.serviceRequest.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { category: true, subservice: true, customer: true, assignments: true },
  });

  const STATUS_BADGE_STYLE: Record<string, string> = {
    DRAFT: "badge-draft",
    SUBMITTED: "badge-submitted",
    MATCHING: "badge-matching",
    ASSIGNED: "badge-assigned",
    ACCEPTED: "badge-accepted",
    IN_PROGRESS: "badge-progress",
    COMPLETED: "badge-completed",
    CANCELLED: "badge-cancelled",
    EXPIRED: "badge-expired",
    DISPUTED: "badge-disputed",
  };

  return (
    <DashboardShell title="Service requests" nav={ADMIN_NAV} active="/admin/requests" user={session.user}>
      <p className="text-[14px] text-slate mb-6">
        Monitor active service bookings, matching histories, and fulfillments.
      </p>

      {/* Desktop Table View */}
      <div className="hidden md:block card !p-0 overflow-x-auto min-w-0">
        <table className="w-full text-[14px] min-w-[650px]">
          <thead>
            <tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
              <th className="px-5 py-3.5 text-left font-bold uppercase tracking-wider text-[11px]">Request</th>
              <th className="text-left font-bold uppercase tracking-wider text-[11px]">Customer</th>
              <th className="text-left font-bold uppercase tracking-wider text-[11px]">Status</th>
              <th className="text-left font-bold uppercase tracking-wider text-[11px]">Matches</th>
              <th className="px-5 text-right font-bold uppercase tracking-wider text-[11px]">View</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-5 py-4">
                  <div className="font-semibold text-forest">{r.title}</div>
                  <div className="text-[12px] text-slate mt-0.5">{r.category.name}{r.subservice ? ` · ${r.subservice.name}` : ""}</div>
                </td>
                <td className="text-slate">{r.customer.name ?? r.customer.email}</td>
                <td>
                  <span className={`badge capitalize ${STATUS_BADGE_STYLE[r.status] || ""}`}>
                    {r.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </td>
                <td className="text-slate">{r.assignments.length} matches</td>
                <td className="px-5 text-right">
                  <Link className="btn btn-ghost !py-1.5 !px-3.5 !text-[13px]" href={`/request/${r.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Stack View */}
      <div className="md:hidden space-y-4">
        {requests.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-[14px] text-slate">No requests found.</p>
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="card p-5 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-[15px] font-bold text-forest">{r.title}</h3>
                  <p className="text-[12.5px] text-slate mt-0.5">
                    {r.category.name} {r.subservice ? `· ${r.subservice.name}` : ""}
                  </p>
                </div>
                <span className={`badge shrink-0 capitalize ${STATUS_BADGE_STYLE[r.status] || ""}`}>
                  {r.status.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-b border-line py-3 text-[13px] text-slate">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate/70 mb-0.5">Customer</span>
                  <span className="font-semibold text-forest">{r.customer.name ?? r.customer.email}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate/70 mb-0.5">Assignments</span>
                  <span className="font-semibold text-forest">{r.assignments.length}</span>
                </div>
              </div>
              <Link className="btn btn-ghost w-full justify-center !text-[13px] py-2.5" href={`/request/${r.id}`}>
                Open Details →
              </Link>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
