"use client";

interface ProviderRoiCardProps {
  metrics: {
    impressionsCount: number;
    profileViewsCount: number;
    contactRevealsCount: number;
    matchedAssignmentsCount: number;
    completedJobsCount: number;
    estimatedRevenueGenerated: number;
  };
}

export default function ProviderRoiCard({ metrics }: ProviderRoiCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50/80 via-white to-teal-50/40 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Platform Value & ROI Report</span>
          <h3 className="font-display text-lg font-bold text-slate-900">Your Subscription Business Impact</h3>
        </div>
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
          0% Commission Paid
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Customer Views</span>
          <span className="font-display text-xl font-black text-slate-900">{metrics.profileViewsCount}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Direct Inquiries</span>
          <span className="font-display text-xl font-black text-emerald-700">{metrics.contactRevealsCount}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Matched Bookings</span>
          <span className="font-display text-xl font-black text-blue-700">{metrics.matchedAssignmentsCount}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Completed Jobs</span>
          <span className="font-display text-xl font-black text-emerald-800">{metrics.completedJobsCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-emerald-950 p-4 text-white gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Estimated Earnings Retained</span>
          <div className="font-display text-2xl font-black text-emerald-400">
            ₹{metrics.estimatedRevenueGenerated.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-200">Calculated from completed local Shivamogga service leads.</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-emerald-300 block">Subscription Advantage</span>
          <span className="text-xs font-bold text-white">No per-job cuts taken by platform</span>
        </div>
      </div>
    </div>
  );
}
