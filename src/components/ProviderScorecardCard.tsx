"use client";

interface ProviderScorecardProps {
  ratingAverage: number;
  ratingCount: number;
  leadResponseRate: number;
  jobsCompleted: number;
}

export default function ProviderScorecardCard({
  ratingAverage,
  ratingCount,
  leadResponseRate,
  jobsCompleted,
}: ProviderScorecardProps) {
  const isTopResponder = leadResponseRate >= 0.85;
  const isTopRated = ratingAverage >= 4.5 && ratingCount >= 3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h4 className="font-display text-sm font-bold text-slate-900">Performance Scorecard</h4>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          Shivamogga Benchmarks
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Rating</span>
          <span className="font-display text-lg font-bold text-amber-600">★ {ratingAverage.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 block">{ratingCount} reviews</span>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Response Speed</span>
          <span className="font-display text-lg font-bold text-emerald-700">
            {Math.round(leadResponseRate * 100)}%
          </span>
          <span className="text-[10px] text-slate-400 block">Lead Accept Rate</span>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed</span>
          <span className="font-display text-lg font-bold text-slate-900">{jobsCompleted}</span>
          <span className="text-[10px] text-slate-400 block">Verified Jobs</span>
        </div>
      </div>

      {/* Peer Benchmarking Badges */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Shivamogga Peer Status
        </span>

        <div className="flex flex-wrap gap-2">
          {isTopResponder && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
              🥇 Top 10% Fast Responder in Shivamogga
            </span>
          )}
          {isTopRated && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full">
              ⭐ Top Tier Rating in Shivamogga
            </span>
          )}
          {!isTopResponder && !isTopRated && (
            <span className="text-xs text-slate-500 font-medium">
              Accept leads faster and maintain a 4.5+ rating to unlock Shivamogga peer badge highlights.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
