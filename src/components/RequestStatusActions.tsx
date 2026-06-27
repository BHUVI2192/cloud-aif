"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RequestStatusActionsProps {
  requestId: string;
  currentStatus: string;
  isOwner: boolean;
  isAdmin: boolean;
  isProvider: boolean;
}

export default function RequestStatusActions({
  requestId,
  currentStatus,
  isOwner,
  isAdmin,
  isProvider,
}: RequestStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  async function updateStatus(nextStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: nextStatus === "CANCELLED" ? note : undefined }),
      });
      if (res.ok) {
        setNote("");
        setShowCancelForm(false);
        router.refresh();
      } else {
        setToastMsg("Failed to update status.");
      }
    } catch {
      setToastMsg("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Determine which actions are available
  const canCancel = (isOwner || isAdmin) && ["DRAFT", "SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(currentStatus);
  const canStart = (isProvider || isAdmin) && currentStatus === "ACCEPTED";
  const canComplete = (isOwner || isProvider || isAdmin) && ["ACCEPTED", "IN_PROGRESS"].includes(currentStatus);

  if (!canCancel && !canStart && !canComplete) return null;

  return (
    <div className="sticky-bottom-bar md:static md:mt-6 md:card md:bg-white md:border md:border-line md:p-6" style={{ borderRadius: "20px" }}>
      <h3 className="text-[14px] md:text-[16px] font-bold mb-3 hidden md:block" style={{ color: "var(--forest)" }}>Manage Request Status</h3>
      
      {showCancelForm ? (
        <div className="space-y-3">
          <label className="label">Reason for cancellation</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Please enter a reason..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              style={{ background: "#a32d2d" }}
              disabled={loading || !note.trim()}
              onClick={() => updateStatus("CANCELLED")}
            >
              Confirm Cancel
            </button>
            <button
              className="btn btn-ghost !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => setShowCancelForm(false)}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {canStart && (
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => updateStatus("IN_PROGRESS")}
            >
              Start Service/Job
            </button>
          )}
          {canComplete && (
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => updateStatus("COMPLETED")}
            >
              Complete Request
            </button>
          )}
          {canCancel && (
            <button
              className="btn btn-ghost !py-2 !text-[13px]"
              style={{ color: "#a32d2d", borderColor: "#a32d2d" }}
              disabled={loading}
              onClick={() => setShowCancelForm(true)}
            >
              Cancel Request
            </button>
          )}
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#14331f] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold animate-slide-up flex items-center gap-2 border border-emerald/20 min-w-[280px] justify-between">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-[16px] font-bold opacity-80 hover:opacity-100 pl-3">×</button>
        </div>
      )}
    </div>
  );
}
