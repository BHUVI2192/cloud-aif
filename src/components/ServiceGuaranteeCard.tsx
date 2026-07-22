"use client";

interface ServiceGuaranteeCardProps {
  compact?: boolean;
}

export default function ServiceGuaranteeCard({ compact }: ServiceGuaranteeCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-900 font-semibold">
        <span className="text-base">🛡️</span>
        <div>
          <span className="font-bold text-emerald-950 block">Ogenzo 7-Day Service Promise</span>
          <span className="text-[11px] text-emerald-700">Free site revisit guaranteed within 7 days if issue recurs.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-linear-to-br from-emerald-50/90 via-white to-teal-50/50 p-5 shadow-xs space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xl shadow-xs">
          🛡️
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
            Platform-Backed Guarantee
          </span>
          <h4 className="font-display text-base font-bold text-slate-900 mt-0.5">7-Day Free Revisit Guarantee</h4>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-medium">
        Your booking is protected by Ogenzo&apos;s Shivamogga Service Guarantee. If the work performed fails or shows defects within 7 days, we arrange a <strong>free site revisit</strong> at zero extra charge.
      </p>

      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold border-t border-emerald-100 pt-2">
        <span>✓ 100% Quality Assured</span>
        <span>✓ Verified Local Professionals</span>
        <span>✓ Zero Hidden Fees</span>
      </div>
    </div>
  );
}
