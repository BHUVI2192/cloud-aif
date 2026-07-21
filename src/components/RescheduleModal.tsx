"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RescheduleModalProps {
  requestId: string;
}

export default function RescheduleModal({ requestId }: RescheduleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !reason) {
      setErrorMsg("Please provide a new date and reason");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate, newTime, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Reschedule failed");
      }
    } catch {
      setErrorMsg("Network error rescheduling request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost text-xs !py-1.5 !px-3 border border-slate-300"
      >
        📅 Reschedule Service
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">Reschedule Service Booking</h3>

            <form onSubmit={handleReschedule} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">New Preferred Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Preferred Time Slot (optional)</label>
                <input
                  type="text"
                  value={newTime}
                  placeholder="e.g. 10:00 - 12:00"
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Reason for Rescheduling</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State reason for changing appointment date..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-emerald-600 focus:outline-none"
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
                  {loading ? "Updating..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
