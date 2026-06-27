"use client";
import { useState } from "react";
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
        alert("Failed to update status.");
      }
    } catch {
      alert("An error occurred.");
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
    <div className="card mt-6" style={{ background: "var(--mist)", borderColor: "var(--sage)" }}>
      <h3 className="text-[16px] font-semibold mb-3" style={{ color: "var(--forest)" }}>Manage Request Status</h3>
      
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
    </div>
  );
}
