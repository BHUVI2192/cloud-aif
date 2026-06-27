"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "APPROVE" | "REJECT" | "REQUEST_INFO" | "SUSPEND" | "REINSTATE";

export default function ProviderReviewActions({
  providerId,
  currentStatus,
}: {
  providerId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<Action | "">("");
  const [showFullForm, setShowFullForm] = useState(false);

  async function act(action: Action, customNotes?: string) {
    setLoading(action);
    const res = await fetch(`/api/admin/providers/${providerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes: customNotes !== undefined ? customNotes : notes }),
    });
    setLoading("");
    if (res.ok) {
      setNotes("");
      setShowFullForm(false);
      router.refresh();
    }
  }

  // Render premium status views for final decision states unless full form is explicitly toggled
  if (!showFullForm) {
    if (currentStatus === "APPROVED") {
      return (
        <div className="rounded-xl p-4 text-center border bg-emerald-50/50 border-emerald-200">
          <p className="font-semibold text-emerald-800 flex items-center justify-center gap-1.5 text-[15px]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ✓ Approved & Active
          </p>
          <p className="text-[13px] mt-1 text-emerald-600">
            This provider profile has been verified and is active.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              className="text-[13px] font-medium text-slate-500 hover:text-slate-700 underline"
              disabled={!!loading}
              onClick={() => setShowFullForm(true)}
            >
              Update Decision
            </button>
            <span className="text-slate-300">|</span>
            <button
              className="text-[13px] font-medium text-amber-600 hover:text-amber-700 underline"
              disabled={!!loading}
              onClick={() => {
                const reason = prompt("Enter suspension reason (optional):") || "";
                act("SUSPEND", reason);
              }}
            >
              {loading === "SUSPEND" ? "Suspending..." : "Suspend"}
            </button>
          </div>
        </div>
      );
    }

    if (currentStatus === "SUSPENDED") {
      return (
        <div className="rounded-xl p-4 text-center border bg-amber-50/50 border-amber-200">
          <p className="font-semibold text-amber-800 flex items-center justify-center gap-1.5 text-[15px]">
            ⚠ Temporarily Suspended
          </p>
          <p className="text-[13px] mt-1 text-amber-600">
            This provider is temporarily disabled and hidden from search.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              className="text-[13px] font-medium text-slate-500 hover:text-slate-700 underline"
              disabled={!!loading}
              onClick={() => setShowFullForm(true)}
            >
              Update Decision
            </button>
            <span className="text-slate-300">|</span>
            <button
              className="text-[13px] font-medium text-emerald-600 hover:text-emerald-700 underline font-semibold"
              disabled={!!loading}
              onClick={() => act("REINSTATE")}
            >
              {loading === "REINSTATE" ? "Reinstating..." : "Reinstate Profile"}
            </button>
          </div>
        </div>
      );
    }

    if (currentStatus === "REJECTED") {
      return (
        <div className="rounded-xl p-4 text-center border bg-red-50/50 border-red-200">
          <p className="font-semibold text-red-800 flex items-center justify-center gap-1.5 text-[15px]">
            ✗ Application Rejected
          </p>
          <p className="text-[13px] mt-1 text-red-600">
            This provider's application has been rejected.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              className="text-[13px] font-medium text-slate-500 hover:text-slate-700 underline"
              disabled={!!loading}
              onClick={() => setShowFullForm(true)}
            >
              Update Decision
            </button>
            <span className="text-slate-300">|</span>
            <button
              className="text-[13px] font-medium text-emerald-600 hover:text-emerald-700 underline font-semibold"
              disabled={!!loading}
              onClick={() => act("APPROVE")}
            >
              {loading === "APPROVE" ? "Approving..." : "Approve Profile"}
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        className="input min-h-[80px]"
        placeholder="Notes / requested changes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <button
          className="btn btn-primary !py-2 !text-[14px]"
          disabled={!!loading}
          onClick={() => act("APPROVE")}
        >
          {loading === "APPROVE" ? "…" : "Approve"}
        </button>
        <button
          className="btn btn-ghost !py-2 !text-[14px]"
          disabled={!!loading}
          onClick={() => act("REQUEST_INFO")}
        >
          {loading === "REQUEST_INFO" ? "…" : "Request info"}
        </button>
        <button
          className="btn btn-ghost !py-2 !text-[14px]"
          disabled={!!loading}
          onClick={() => act("SUSPEND")}
        >
          {loading === "SUSPEND" ? "…" : "Suspend"}
        </button>
        <button
          className="btn btn-ghost !py-2 !text-[14px]"
          style={{ color: "#a32d2d" }}
          disabled={!!loading}
          onClick={() => act("REJECT")}
        >
          {loading === "REJECT" ? "…" : "Reject"}
        </button>
      </div>
      {showFullForm && (
        <button
          className="w-full text-center text-[12px] text-slate-400 hover:text-slate-600 mt-2 underline"
          onClick={() => setShowFullForm(false)}
        >
          Cancel Update
        </button>
      )}
    </div>
  );
}
