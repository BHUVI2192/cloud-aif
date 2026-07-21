"use client";
import Link from "next/link";

interface ProviderSubscriptionCardProps {
  subscription: {
    status: string;
    plan: string;
    trialEndsAt: string | Date;
    currentPeriodEnd: string | Date;
    monthlyLeadLimit: number | null;
    leadsUsedThisPeriod: number;
  };
  daysRemaining: number;
  periodLeads: number;
}

export default function ProviderSubscriptionCard({
  subscription,
  daysRemaining,
  periodLeads,
}: ProviderSubscriptionCardProps) {
  const limit = subscription.monthlyLeadLimit;
  const leadPercentage = limit ? Math.min(100, Math.round((periodLeads / limit) * 100)) : 0;

  const statusColors: Record<string, string> = {
    FREE_TRIAL: "bg-blue-100 text-blue-900 border-blue-300",
    ACTIVE: "bg-emerald-100 text-emerald-900 border-emerald-300",
    GRACE_PERIOD: "bg-amber-100 text-amber-900 border-amber-300",
    EXPIRED: "bg-red-100 text-red-900 border-red-300",
    SUSPENDED: "bg-slate-200 text-slate-800 border-slate-300",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Subscription Plan</span>
          <h3 className="font-display text-base font-bold text-slate-900">{subscription.plan} Membership</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[subscription.status] || "bg-slate-100 text-slate-800"}`}>
          {subscription.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 border-t pt-3">
        <div>
          <span>Days Remaining:</span>
          <p className="font-display text-lg font-black text-slate-900">{daysRemaining} Days</p>
        </div>
        <div>
          <span>Period Leads:</span>
          <p className="font-display text-lg font-black text-slate-900">
            {periodLeads} {limit ? `/ ${limit}` : "(Unlimited)"}
          </p>
        </div>
      </div>

      {limit && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-600">
            <span>Monthly Quota Usage</span>
            <span>{leadPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${
                leadPercentage > 85 ? "bg-amber-500" : "bg-emerald-600"
              }`}
              style={{ width: `${leadPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Link href="/provider/subscription" className="btn btn-ghost text-xs !py-1.5 !px-3 border border-slate-300">
          ⚙️ Manage Subscription & Value Report →
        </Link>
      </div>
    </div>
  );
}
