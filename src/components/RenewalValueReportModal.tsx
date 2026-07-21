"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RenewalValueReportModalProps {
  metrics: {
    periodLeads: number;
    contactReveals: number;
    completedJobsCount: number;
    selfReportedTotal: number;
    estimatedTotal: number;
    daysRemaining: number;
  };
  planName: string;
}

export default function RenewalValueReportModal({ metrics, planName }: RenewalValueReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const estSubCost = selectedPlan === "STARTER" ? 499 : selectedPlan === "PRO" ? 899 : 1499;
  const roiMultiplier = Math.max(1, Math.round(metrics.estimatedTotal / (estSubCost || 1)));

  const handleRenew = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/provider/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary text-xs !py-2.5 !px-4 shadow-sm bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
      >
        📊 View Pre-Renewal ROI Value Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Pre-Renewal Value Justification
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Your Subscription ROI Impact</h3>
              <p className="text-xs text-slate-500">Review platform earnings delivered before renewing your {planName} plan.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Leads</span>
                <span className="font-display text-xl font-black text-slate-900">{metrics.periodLeads}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Direct Inquiries</span>
                <span className="font-display text-xl font-black text-blue-800">{metrics.contactReveals}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Revenue Generated</span>
                <span className="font-display text-xl font-black text-emerald-700">₹{metrics.estimatedTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-950 p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Estimated ROI Return</span>
                <div className="font-display text-3xl font-black text-emerald-400">{roiMultiplier}x Return</div>
                <p className="text-[11px] text-emerald-200 mt-0.5">Every ₹1 spent generated ₹{roiMultiplier} in local service fees.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Commissions Paid</span>
                <span className="font-display text-2xl font-black text-white">₹0</span>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Select Renewal Plan</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "STARTER", name: "Starter", price: "₹499/mo", limit: "50 Leads" },
                  { id: "PRO", name: "Pro", price: "₹899/mo", limit: "100 Leads" },
                  { id: "UNLIMITED", name: "Unlimited", price: "₹1,499/mo", limit: "Unlimited" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedPlan === p.id
                        ? "border-emerald-600 bg-emerald-50/70 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">{p.name}</span>
                    <span className="font-mono text-xs font-black text-emerald-700 block">{p.price}</span>
                    <span className="text-[10px] text-slate-500">{p.limit}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost text-xs !py-2 !px-3"
              >
                Close Report
              </button>
              <button
                type="button"
                onClick={handleRenew}
                disabled={loading}
                className="btn btn-primary text-xs !py-2.5 !px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {loading ? "Renewing..." : `Confirm & Renew (${selectedPlan})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
