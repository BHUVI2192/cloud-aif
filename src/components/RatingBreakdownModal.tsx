"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RatingBreakdownModalProps {
  requestId: string;
  onSuccess?: () => void;
}

export default function RatingBreakdownModal({ requestId, onSuccess }: RatingBreakdownModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [overall, setOverall] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [behavior, setBehavior] = useState(5);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: overall,
          comment,
          punctuality,
          behavior,
          serviceQuality,
          valueForMoney,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to submit review");
      }
    } catch {
      setErrorMsg("Network error submitting review");
    } finally {
      setLoading(false);
    }
  };

  const renderStarSelector = (value: number, setValue: (v: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setValue(star)}
          className={`text-xl transition ${star <= value ? "text-amber-400" : "text-slate-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary text-xs !py-2.5 !px-4 shadow-sm"
      >
        ⭐ Leave Detailed Service Review
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">Rate Service Quality</h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between border-b pb-2">
                <span>Overall Rating</span>
                {renderStarSelector(overall, setOverall)}
              </div>
              <div className="flex items-center justify-between">
                <span>Punctuality & Arrival Time</span>
                {renderStarSelector(punctuality, setPunctuality)}
              </div>
              <div className="flex items-center justify-between">
                <span>Provider Behavior & Courtesy</span>
                {renderStarSelector(behavior, setBehavior)}
              </div>
              <div className="flex items-center justify-between">
                <span>Service Quality & Craftsmanship</span>
                {renderStarSelector(serviceQuality, setServiceQuality)}
              </div>
              <div className="flex items-center justify-between">
                <span>Value for Money</span>
                {renderStarSelector(valueForMoney, setValueForMoney)}
              </div>

              <div>
                <label className="block mb-1 font-bold">Feedback / Remarks</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience..."
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
                  {loading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
