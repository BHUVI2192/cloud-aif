"use client";

interface TrialAttributionCloseCardProps {
  metrics: {
    periodLeads: number;
    contactReveals: number;
    completedJobsCount: number;
    selfReportedTotal: number;
    estimatedTotal: number;
    daysRemaining: number;
  };
  onActivate?: () => void;
}

export default function TrialAttributionCloseCard({ metrics, onActivate }: TrialAttributionCloseCardProps) {
  return (
    <div className="rounded-2xl border-2 border-blue-300 bg-linear-to-br from-blue-50/90 via-white to-indigo-50/50 p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-blue-200 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
            Free Trial Summary Report
          </span>
          <h3 className="font-display text-lg font-bold text-slate-900 mt-1">What You Received During Your 14-Day Trial</h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-blue-900">{metrics.daysRemaining} Days Left</span>
          <p className="text-[10px] text-blue-700">Trial Period</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white p-3 border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Leads Received</span>
          <span className="font-display text-xl font-black text-blue-900">{metrics.periodLeads}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Phone/WA Inquiries</span>
          <span className="font-display text-xl font-black text-indigo-700">{metrics.contactReveals}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Jobs Completed</span>
          <span className="font-display text-xl font-black text-emerald-800">{metrics.completedJobsCount}</span>
        </div>
        <div className="rounded-xl bg-white p-3 border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Earnings Delivered</span>
          <span className="font-display text-xl font-black text-emerald-700">₹{metrics.estimatedTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-slate-900 p-4 text-white gap-3">
        <div>
          <h4 className="font-bold text-sm text-white">Keep receiving Shivamogga service leads</h4>
          <p className="text-xs text-slate-300">Choose a subscription plan to maintain lead delivery without interruption.</p>
        </div>
        <button
          onClick={onActivate}
          className="btn btn-primary text-xs !py-2.5 !px-5 shrink-0 bg-emerald-600 hover:bg-emerald-700 border-none text-white font-bold"
        >
          Select Subscription Plan →
        </button>
      </div>
    </div>
  );
}
