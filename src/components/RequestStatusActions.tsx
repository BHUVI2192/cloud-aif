"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [selectedReasonKey, setSelectedReasonKey] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cancellationReasons = [
    { key: "cancel_found_another", value: "Found another provider" },
    { key: "cancel_price_high", value: "Price was too high" },
    { key: "cancel_no_response", value: "Provider did not respond" },
    { key: "cancel_change_plans", value: "Change of plans" },
    { key: "cancel_other", value: "Other" }
  ];

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  async function updateStatus(nextStatus: "EN_ROUTE" | "ARRIVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, note: nextStatus === "CANCELLED" ? note : undefined }),
      });
      if (res.ok) {
        setNote("");
        setSelectedReasonKey(null);
        setShowCancelForm(false);
        router.refresh();
      } else {
        const data = await res.json();
        setToastMsg(data.error || "Failed to update status.");
      }
    } catch {
      setToastMsg("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // Determine which actions are available
  const canCancel = (isOwner || isAdmin) && ["DRAFT", "SUBMITTED", "MATCHING", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED_NEARBY", "ARRIVED", "IN_PROGRESS"].includes(currentStatus);
  const canStartTravel = (isProvider || isAdmin) && currentStatus === "ACCEPTED";
  const canMarkArrived = (isProvider || isAdmin) && ["EN_ROUTE", "ARRIVED_NEARBY"].includes(currentStatus);
  const canStartAdmin = isAdmin && ["ARRIVED_NEARBY", "ARRIVED"].includes(currentStatus);
  const canComplete = (isOwner || isProvider || isAdmin) && ["ACCEPTED", "IN_PROGRESS"].includes(currentStatus);

  if (!canCancel && !canStartTravel && !canMarkArrived && !canStartAdmin && !canComplete) return null;

  return (
    <div className="sticky-bottom-bar md:static md:mt-6 md:card md:bg-white md:border md:border-line md:p-6" style={{ borderRadius: "20px" }}>
      <h3 className="text-[14px] md:text-[16px] font-bold mb-3 hidden md:block" style={{ color: "var(--forest)" }}>Manage Request Status</h3>
      
      {showCancelForm ? (
        <div className="space-y-4">
          <label className="label text-[13px] font-bold text-forest">Reason for cancellation</label>
          
          <div className="flex flex-wrap gap-2">
            {cancellationReasons.map((r) => {
              const isSelected = selectedReasonKey === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelectedReasonKey(r.key);
                    if (r.key !== "cancel_other") {
                      setNote(r.value);
                    } else {
                      setNote("");
                    }
                  }}
                  className={`px-4 py-2 text-[12.5px] font-semibold rounded-full border transition-all duration-150 ${
                    isSelected
                      ? "bg-mist border-brand text-brand"
                      : "bg-white border-line text-slate hover:border-slate/30"
                  }`}
                  style={{ minHeight: "40px" }}
                >
                  {t(r.key)}
                </button>
              );
            })}
          </div>

          {selectedReasonKey === "cancel_other" && (
            <textarea
              className="input min-h-[80px]"
              placeholder="Please enter a reason..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              style={{ fontSize: "16px" }}
            />
          )}

          <div className="flex gap-2 pt-1">
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              style={{ background: "#a32d2d" }}
              disabled={loading || !selectedReasonKey || (selectedReasonKey === "cancel_other" && !note.trim())}
              onClick={() => updateStatus("CANCELLED")}
            >
              Confirm Cancel
            </button>
            <button
              className="btn btn-ghost !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => {
                setShowCancelForm(false);
                setSelectedReasonKey(null);
                setNote("");
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {canStartTravel && (
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => updateStatus("EN_ROUTE")}
            >
              🚗 Start Travel
            </button>
          )}
          {canMarkArrived && (
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => updateStatus("ARRIVED")}
            >
              📍 Arrived at Site
            </button>
          )}
          {canStartAdmin && (
            <button
              className="btn btn-primary !py-2 !text-[13px]"
              disabled={loading}
              onClick={() => updateStatus("IN_PROGRESS")}
            >
              Start Service (Admin Bypass)
            </button>
          )}
          {canComplete && currentStatus === "IN_PROGRESS" && (
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
