"use client";

export function LeadSafetyNetCard({
  rolloverLeads,
  monthlyLeadLimit,
  leadsUsedThisPeriod,
}: {
  rolloverLeads: number;
  monthlyLeadLimit: number | null;
  leadsUsedThisPeriod: number;
}) {
  const isLowLeadMonth = leadsUsedThisPeriod < 5;

  return (
    <div className="card border border-emerald-200 bg-emerald-50/50 p-5 rounded-2xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
          🛡️ Lead Safety Net Active
        </span>
        <span className="text-[13px] font-bold font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
          +{rolloverLeads} Rollover Credits
        </span>
      </div>

      <div>
        <h3 className="text-[16px] font-bold text-gray-900">
          "Zero Waste" Rollover Guarantee
        </h3>
        <p className="text-[13px] text-gray-600 mt-0.5">
          Unused lead allowances never expire—they automatically roll over into your safety net buffer. If you receive under 5 leads in a billing month, Cloud AIF grants +10 bonus lead credits on renewal.
        </p>
      </div>

      {isLowLeadMonth && (
        <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-[12px] text-emerald-900 font-medium flex items-center gap-2">
          <span>✨ Low-lead protection qualified: +10 bonus lead credits will be credited on your next renewal.</span>
        </div>
      )}
    </div>
  );
}
