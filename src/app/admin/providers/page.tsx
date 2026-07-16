import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProviders() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/providers");
  const providers = await db.providerProfile.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: true, primaryCategory: true },
  });

  const statusColors: Record<string, string> = {
    PENDING_VERIFICATION: "bg-orange-50 text-orange-700 border-orange-100",
    UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-100",
    NEEDS_MORE_INFO: "bg-amber-50 text-amber-700 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    REJECTED: "bg-red-50 text-red-700 border-red-100",
    SUSPENDED: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <DashboardShell title="Providers" nav={ADMIN_NAV} active="/admin/providers" user={session.user}>
      <p className="text-[14px] text-slate mb-6">
        Verify, approve, and manage local service provider profiles.
      </p>

      {/* Desktop Table View */}
      <div className="hidden md:block card !p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
              <th className="px-5 py-3.5 text-left font-bold uppercase tracking-wider text-[11px]">Provider</th>
              <th className="text-left font-bold uppercase tracking-wider text-[11px]">Category</th>
              <th className="text-left font-bold uppercase tracking-wider text-[11px]">Status</th>
              <th className="text-right px-5 font-bold uppercase tracking-wider text-[11px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-t" style={{ borderColor: "var(--line)" }}>
                <td className="px-5 py-4">
                  <div className="font-semibold text-forest">{p.displayName}</div>
                  <div className="text-[12px] text-slate mt-0.5">{p.user.email}</div>
                </td>
                <td className="text-slate">{p.primaryCategory?.name ?? "—"}</td>
                <td>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${statusColors[p.status] ?? "bg-slate-50 text-slate-700 border-slate-100"}`}>
                    {p.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </td>
                <td className="px-5 text-right">
                  <Link className="btn btn-ghost !py-1.5 !px-3.5 !text-[13px]" href={`/admin/providers/${p.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards Stack View */}
      <div className="md:hidden space-y-4">
        {providers.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-[14px] text-slate">No providers found.</p>
          </div>
        ) : (
          providers.map((p) => (
            <div key={p.id} className="card p-5 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-[15px] font-bold text-forest">{p.displayName}</h3>
                  <p className="text-[12px] text-slate mt-0.5">{p.user.email}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border capitalize shrink-0 ${statusColors[p.status] ?? "bg-slate-50 text-slate-700 border-slate-100"}`}>
                  {p.status.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-b border-line py-3 text-[13px]">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate/70 mb-0.5">Primary Category</span>
                  <span className="font-semibold text-forest">{p.primaryCategory?.name ?? "—"}</span>
                </div>
              </div>
              <Link className="btn btn-ghost w-full justify-center !text-[13px] py-2.5" href={`/admin/providers/${p.id}`}>
                Review Account →
              </Link>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
