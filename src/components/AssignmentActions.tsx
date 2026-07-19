"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function AssignmentActions({
  assignmentId,
  assignmentStatus,
  requestId,
}: {
  assignmentId: string;
  assignmentStatus?: string;
  requestId?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineNote, setDeclineNote] = useState("");
  const [selectedDeclineKey, setSelectedDeclineKey] = useState<string | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const declineReasons = [
    { key: "decline_too_far", value: "Too far / out of area" },
    { key: "decline_schedule_conflict", value: "Schedule conflict" },
    { key: "decline_price_low", value: "Price is too low" },
    { key: "decline_wrong_category", value: "Incorrect category" },
    { key: "decline_other", value: "Other" }
  ];

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  async function respond(action: "ACCEPT" | "DECLINE") {
    setLoading(action);
    const res = await fetch(`/api/assignments/${assignmentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note: action === "DECLINE" ? declineNote : undefined }),
    });
    setLoading("");
    if (res.ok) {
      setShowDeclineForm(false);
      setSelectedDeclineKey(null);
      setDeclineNote("");
      router.refresh();
    } else {
      setToastMsg("Failed to update. Please try again.");
    }
  }

  async function markComplete() {
    if (!requestId) return;
    setLoading("COMPLETE");
    const res = await fetch(`/api/requests/${requestId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    setLoading("");
    if (res.ok) {
      setShowCompleteConfirm(false);
      router.refresh();
    } else {
      setToastMsg("Failed to mark as complete.");
    }
  }

  const renderToast = () => {
    if (!toastMsg) return null;
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#14331f] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold animate-slide-up flex items-center gap-2 border border-emerald/20 min-w-[280px] justify-between">
        <div className="flex items-center gap-2">
          <span>ℹ️</span>
          <span>{toastMsg}</span>
        </div>
        <button onClick={() => setToastMsg(null)} className="text-[16px] font-bold opacity-80 hover:opacity-100 pl-3">×</button>
      </div>
    );
  };

  // For ACCEPTED jobs — show "Mark as Complete" button
  if (assignmentStatus === "ACCEPTED") {
    if (showCompleteConfirm) {
      return (
        <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0">
          <div className="rounded-xl p-4 space-y-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <p className="text-[14px] font-semibold" style={{ color: "#15803d" }}>
              Confirm that the job is fully done and the customer is satisfied?
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-primary !py-2 !text-[13px]"
                style={{ background: "#16a34a" }}
                disabled={loading === "COMPLETE"}
                onClick={markComplete}
              >
                {loading === "COMPLETE" ? "Updating…" : "✓ Yes, Mark as Completed"}
              </button>
              <button
                className="btn btn-ghost !py-2 !text-[13px]"
                disabled={!!loading}
                onClick={() => setShowCompleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
          {renderToast()}
        </div>
      );
    }
    return (
      <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0">
        <button
          className="btn btn-primary w-full md:w-auto !py-2 !text-[14px]"
          style={{ background: "#16a34a" }}
          disabled={!!loading}
          onClick={() => setShowCompleteConfirm(true)}
        >
          ✓ Mark Job as Completed
        </button>
        {renderToast()}
      </div>
    );
  }

  // For PENDING jobs — show Accept / Decline
  if (showDeclineForm) {
    return (
      <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0">
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#fdf2f2", border: "1px solid #fbd5d5" }}>
          <p className="text-[13px] font-semibold" style={{ color: "#a32d2d" }}>
            Please select a reason for declining:
          </p>
          
          <div className="flex flex-wrap gap-2 py-1">
            {declineReasons.map((r) => {
              const isSelected = selectedDeclineKey === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelectedDeclineKey(r.key);
                    if (r.key !== "decline_other") {
                      setDeclineNote(r.value);
                    } else {
                      setDeclineNote("");
                    }
                  }}
                  className={`px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-all duration-150 ${
                    isSelected
                      ? "bg-red-50 border-red-500 text-red-700"
                      : "bg-white border-line text-slate hover:border-slate/30"
                  }`}
                  style={{ minHeight: "36px" }}
                >
                  {t(r.key)}
                </button>
              );
            })}
          </div>

          {selectedDeclineKey === "decline_other" && (
            <textarea
              className="input w-full min-h-[70px] text-[13px]"
              placeholder="e.g. out of service area, schedule mismatch..."
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              disabled={!!loading}
              style={{ fontSize: "16px" }}
            />
          )}

          <div className="flex gap-2">
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              style={{ background: "#a32d2d" }}
              disabled={loading === "DECLINE" || !selectedDeclineKey || (selectedDeclineKey === "decline_other" && !declineNote.trim())}
              onClick={() => respond("DECLINE")}
            >
              {loading === "DECLINE" ? "Declining…" : "Confirm Decline"}
            </button>
            <button
              className="btn btn-ghost !py-2 !text-[13px]"
              disabled={!!loading}
              onClick={() => {
                setShowDeclineForm(false);
                setSelectedDeclineKey(null);
                setDeclineNote("");
              }}
            >
              Back
            </button>
          </div>
        </div>
        {renderToast()}
      </div>
    );
  }

  return (
    <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0">
      <div className="flex gap-2">
        <button
          className="btn btn-primary flex-1 md:flex-initial !py-2.5 !text-[14px]"
          disabled={!!loading}
          onClick={() => respond("ACCEPT")}
        >
          {loading === "ACCEPT" ? "Accepting…" : "✓ Accept Job"}
        </button>
        <button
          className="btn btn-ghost flex-1 md:flex-initial !py-2.5 !text-[14px]"
          style={{ color: "#a32d2d", borderColor: "#fbd5d5" }}
          disabled={!!loading}
          onClick={() => setShowDeclineForm(true)}
        >
          ✗ Decline
        </button>
      </div>
      {renderToast()}
    </div>
  );
}
