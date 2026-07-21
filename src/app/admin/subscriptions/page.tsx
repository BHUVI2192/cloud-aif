import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";
import Link from "next/link";
import { getSubscriptionMetrics } from "@/lib/subscription";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/subscriptions");

  const subscriptions = await db.providerSubscription.findMany({
    orderBy: { currentPeriodEnd: "asc" },
    include: {
      provider: {
        select: {
          id: true,
          displayName: true,
          primaryCategory: { select: { name: true } },
          user: { select: { phone: true, email: true } },
        },
      },
    },
  });

  const subsWithMetrics = await Promise.all(
    subscriptions.map(async (s) => {
      const metrics = await getSubscriptionMetrics(s.providerId);
      return { ...s, metrics };
    })
  );

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialCount = subscriptions.filter((s) => s.status === "FREE_TRIAL").length;
  const graceCount = subscriptions.filter((s) => s.status === "GRACE_PERIOD").length;
  const churnRiskCount = subsWithMetrics.filter((s) => s.metrics.isRenewalNear && s.metrics.selfReportedTotal === 0).length;

  return (
    <DashboardShell title="Subscription Revenue Console" nav={ADMIN_NAV} active="/admin/subscriptions" user={session.user}>
      <div className="space-y-6">
        {/* Metric summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card border-l-4 border-emerald-500">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Subscriptions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{activeCount}</div>
          </div>
          <div className="card border-l-4 border-blue-500">
            <span className="text-xs font-semibold text-slate-500 uppercase">Free Trials</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{trialCount}</div>
          </div>
          <div className="card border-l-4 border-amber-500">
            <span className="text-xs font-semibold text-slate-500 uppercase">Grace Period</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{graceCount}</div>
          </div>
          <div className="card border-l-4 border-rose-500">
            <span className="text-xs font-semibold text-slate-500 uppercase">High Churn Risk</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{churnRiskCount}</div>
          </div>
        </div>

        {/* Console Table */}
        <div className="card !p-0 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b">
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="text-left">Plan</th>
                <th className="text-left">Status</th>
                <th className="text-left">Period Leads</th>
                <th className="text-left">Earnings Retained</th>
                <th className="text-left">Expires In</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subsWithMetrics.map((s) => (
                <tr key={s.id} className={`border-t ${s.metrics.isRenewalNear ? "bg-amber-50/50" : ""}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/providers/${s.provider.id}`} className="font-bold text-indigo-900 hover:underline">
                      {s.provider.displayName}
                    </Link>
                    <span className="text-[10px] text-slate-500 block">{s.provider.primaryCategory?.name}</span>
                  </td>
                  <td>
                    <span className="font-bold text-slate-800">{s.plan}</span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "FREE_TRIAL"
                          ? "bg-blue-100 text-blue-800"
                          : s.status === "GRACE_PERIOD"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="font-bold text-slate-700">{s.metrics.periodLeads} leads</td>
                  <td className="font-bold text-emerald-700">₹{s.metrics.selfReportedTotal}</td>
                  <td className="font-semibold text-slate-600">{s.metrics.daysRemaining} days</td>
                  <td className="px-4 text-right">
                    <form action="/api/admin/subscriptions" method="POST" className="inline-flex items-center gap-1">
                      <input type="hidden" name="providerId" value={s.providerId} />
                      <input type="hidden" name="action" value="EXTEND_GRACE" />
                      <input type="hidden" name="extendDays" value="7" />
                      <button type="submit" className="btn btn-ghost !py-1 !px-2 text-[10px] border border-amber-300 text-amber-900 bg-amber-50">
                        +7D Grace
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
