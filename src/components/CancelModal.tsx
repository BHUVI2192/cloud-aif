"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CancelModalProps {
  requestId: string;
}

export default function CancelModal({ requestId }: CancelModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Reason is required for cancellation");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Cancellation failed");
      }
    } catch {
      setErrorMsg("Network error cancelling request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost text-xs !py-1.5 !px-3 border border-red-200 text-red-700 hover:bg-red-50"
      >
        🚫 Cancel Request
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-red-950">Cancel Service Request</h3>
            <p className="text-xs text-slate-600">Are you sure you want to cancel this booking?</p>

            <form onSubmit={handleCancel} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us why you are cancelling..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-red-600 focus:outline-none"
                />
              </div>

              {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost text-xs !py-2 !px-3"
                >
                  Keep Request
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason.trim()}
                  className="btn text-xs !py-2.5 !px-5 bg-red-600 text-white hover:bg-red-700"
                >
                  {loading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
