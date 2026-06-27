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

  return (
    <DashboardShell title="Service requests" nav={ADMIN_NAV} active="/admin/requests" user={session.user}>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead><tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
            <th className="px-4 py-3 text-left">Request</th><th className="text-left">Customer</th><th className="text-left">Status</th><th className="text-left">Assigned</th><th className="px-4 text-right">View</th>
          </tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-4 py-3">
                  <div className="font-semibold" style={{ color: "var(--forest)" }}>{r.title}</div>
                  <div className="text-[12px]" style={{ color: "var(--slate)" }}>{r.category.name}{r.subservice ? ` · ${r.subservice.name}` : ""}</div>
                </td>
                <td style={{ color: "var(--slate)" }}>{r.customer.name ?? r.customer.email}</td>
                <td><span className="badge capitalize">{r.status.replace(/_/g, " ").toLowerCase()}</span></td>
                <td style={{ color: "var(--slate)" }}>{r.assignments.length}</td>
                <td className="px-4 text-right"><Link className="btn btn-ghost !py-1.5 !text-[13px]" href={`/request/${r.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
