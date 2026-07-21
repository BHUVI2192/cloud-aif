"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JobOutcomePromptModalProps {
  requestId: string;
  onSuccess?: () => void;
}

export default function JobOutcomePromptModal({ requestId, onSuccess }: JobOutcomePromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(true);
  const [amount, setAmount] = useState<string>("500");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/requests/${requestId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wasCompleted,
          selfReportedValue: parseFloat(amount) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to record outcome");
      }
    } catch {
      setErrorMsg("Network error recording outcome");
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = ["300", "500", "800", "1200", "2000"];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary text-xs !py-2.5 !px-4 shadow-sm"
      >
        🏁 Complete Job & Report Earnings (5s)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                5-Second Outcome Capture
              </span>
              <h3 className="font-display text-lg font-bold text-slate-900 mt-1">Record Job Completion</h3>
              <p className="text-xs text-slate-500">Report earnings to track your subscription platform ROI.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                <span>Job Completed Successfully?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWasCompleted(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      wasCompleted ? "bg-emerald-600 text-white shadow-xs" : "bg-white border text-slate-700"
                    }`}
                  >
                    Yes ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setWasCompleted(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      !wasCompleted ? "bg-red-600 text-white shadow-xs" : "bg-white border text-slate-700"
                    }`}
                  >
                    No ✕
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-800">Total Fee Collected (₹)</label>
                <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        amount === preset ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 border"
                      }`}
                    >
                      ₹{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-lg font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost text-xs !py-2 !px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary text-xs !py-2.5 !px-5"
                >
                  {loading ? "Saving..." : "Submit & Complete Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
