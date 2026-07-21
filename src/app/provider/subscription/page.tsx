import { requireRoleOrRedirect } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import { PROVIDER_NAV } from "@/lib/nav";
import { getSubscriptionMetrics } from "@/lib/subscription";
import { getProviderRoiMetrics } from "@/lib/attribution";
import ProviderSubscriptionCard from "@/components/ProviderSubscriptionCard";
import TrialAttributionCloseCard from "@/components/TrialAttributionCloseCard";
import RenewalValueReportModal from "@/components/RenewalValueReportModal";
import ProviderRoiCard from "@/components/ProviderRoiCard";
import { ProviderReferralCard } from "@/components/ProviderReferralCard";
import { LeadSafetyNetCard } from "@/components/LeadSafetyNetCard";

export const dynamic = "force-dynamic";

export default async function ProviderSubscriptionPage() {
  const session = await requireRoleOrRedirect(["PROVIDER"], "/provider/subscription");

  const provider = await db.providerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!provider) {
    return (
      <DashboardShell title="Subscription & ROI" nav={PROVIDER_NAV} active="/provider/subscription" user={session.user}>
        <div className="p-8 text-center text-xs font-bold text-slate-500">Provider profile not found.</div>
      </DashboardShell>
    );
  }

  const [metrics, roiMetrics] = await Promise.all([
    getSubscriptionMetrics(provider.id),
    getProviderRoiMetrics(provider.id),
  ]);
  const isTrial = metrics.subscription.status === "FREE_TRIAL";

  return (
    <DashboardShell title="Subscription & ROI Workspace" nav={PROVIDER_NAV} active="/provider/subscription" user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Subscription & ROI Value Center</h1>
          <p className="text-xs text-slate-500">
            Track your lead acquisition, self-reported earnings, and plan status.
          </p>
        </div>

        {/* Trial Attribution Close or Renewal Report Banner */}
        {isTrial ? (
          <TrialAttributionCloseCard metrics={metrics} />
        ) : (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-950 p-5 text-white">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Pre-Renewal Justification</span>
              <h3 className="font-display text-lg font-bold">Your Membership Renewal Summary</h3>
              <p className="text-xs text-emerald-200">
                You have received {metrics.periodLeads} leads generating ~₹{metrics.estimatedTotal.toLocaleString("en-IN")} in local service fees.
              </p>
            </div>
            <RenewalValueReportModal metrics={metrics} planName={metrics.subscription.plan} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProviderRoiCard metrics={roiMetrics} />
          </div>

          <div className="space-y-6">
            <ProviderSubscriptionCard
              subscription={metrics.subscription}
              daysRemaining={metrics.daysRemaining}
              periodLeads={metrics.periodLeads}
            />

            <LeadSafetyNetCard
              rolloverLeads={metrics.subscription.rolloverLeads || 0}
              monthlyLeadLimit={metrics.subscription.monthlyLeadLimit}
              leadsUsedThisPeriod={metrics.subscription.leadsUsedThisPeriod || 0}
            />

            <ProviderReferralCard
              referralCode={metrics.subscription.referralCode || "SHI-PRO-1001"}
              providerId={provider.id}
            />

            <div className="bg-white p-5 rounded-2xl border border-line space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate">🔗 Public Shareable Profile</span>
              <p className="text-[13px] text-slate-600">
                Share your verified pro page directly with private clients on WhatsApp & Instagram:
              </p>
              <a
                href={`/p/${provider.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary w-full text-[13px] font-bold text-forest border-forest/20 flex items-center justify-center gap-1.5"
              >
                ↗ Open Public Profile (/p/{provider.id.slice(0, 8)}...)
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
