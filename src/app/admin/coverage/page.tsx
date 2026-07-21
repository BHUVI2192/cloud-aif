import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminCoveragePage() {
  const session = await requireRoleOrRedirect(["ADMIN", "SUPER_ADMIN"], "/admin/coverage");

  const [categories, serviceAreas, requests, providers] = await Promise.all([
    db.category.findMany({ where: { isActive: true, deletedAt: null }, select: { id: true, name: true, slug: true } }),
    db.serviceArea.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    db.serviceRequest.findMany({ select: { categoryId: true, serviceAreaId: true } }),
    db.providerProfile.findMany({
      where: { status: "APPROVED", isActive: true },
      select: {
        id: true,
        primaryCategoryId: true,
        serviceAreas: { select: { serviceAreaId: true } },
      },
    }),
  ]);

  const coverageMatrix = categories.map((cat) => {
    const catRequests = requests.filter((r) => r.categoryId === cat.id).length;
    const catProviders = providers.filter((p) => p.primaryCategoryId === cat.id).length;
    const isCriticalGap = catRequests > 0 && catProviders === 0;

    return {
      catId: cat.id,
      catName: cat.name,
      requestsCount: catRequests,
      providersCount: catProviders,
      gapRatio: (catRequests / Math.max(1, catProviders)).toFixed(1),
      isCriticalGap,
    };
  });

  return (
    <DashboardShell title="Coverage Gaps & Supply Matrix" nav={ADMIN_NAV} active="/admin/coverage" user={session.user}>
      <div className="space-y-6">
        <div className="card bg-indigo-50/70 border-indigo-200">
          <h3 className="font-display text-sm font-bold text-indigo-950">Shivamogga Service Coverage Intelligence</h3>
          <p className="text-xs text-indigo-800 mt-1">
            This matrix compares customer booking demand against approved active provider supply across Shivamogga categories.
          </p>
        </div>

        <div className="card !p-0 overflow-x-auto min-w-0">
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b">
                <th className="px-4 py-3 text-left">Category</th>
                <th className="text-left">Approved Providers</th>
                <th className="text-left">Total Customer Requests</th>
                <th className="text-left">Demand/Supply Ratio</th>
                <th className="px-4 text-right">Coverage Status</th>
              </tr>
            </thead>
            <tbody>
              {coverageMatrix.map((row) => (
                <tr key={row.catId} className={`border-t ${row.isCriticalGap ? "bg-rose-50/70" : ""}`}>
                  <td className="px-4 py-3 font-bold text-slate-900">{row.catName}</td>
                  <td className="font-bold text-slate-800">{row.providersCount} providers</td>
                  <td className="font-bold text-slate-700">{row.requestsCount} requests</td>
                  <td className="font-mono font-bold text-slate-900">{row.gapRatio} x</td>
                  <td className="px-4 text-right">
                    {row.isCriticalGap ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
                        🚨 Zero Provider Supply Gap
                      </span>
                    ) : Number(row.gapRatio) > 3 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">
                        ⚠️ High Unmet Demand
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                        ✓ Balanced Coverage
                      </span>
                    )}
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
