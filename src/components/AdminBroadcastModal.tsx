"use client";
import { useState } from "react";

export default function AdminBroadcastModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetSegment, setTargetSegment] = useState("ALL_PROVIDERS");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetSegment, title, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to dispatch broadcast");
      }

      const data = await res.json();
      setResult(`Successfully dispatched broadcast to ${data.recipientCount} users.`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary text-xs bg-indigo-50 text-indigo-900 border-indigo-300 font-bold"
      >
        📢 Broadcast Message
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📢</span> Segmented Broadcast Dispatch
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {result ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-4xl">🚀</span>
                <h4 className="font-display text-base font-bold text-slate-900">Broadcast Dispatched</h4>
                <p className="text-xs text-slate-600">{result}</p>
                <button onClick={() => setIsOpen(false)} className="btn btn-primary text-xs">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">{error}</div>}

                <div>
                  <label className="label mb-1">Target Segment</label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                  >
                    <option value="ALL_PROVIDERS">All Service Providers</option>
                    <option value="EXPIRING_TRIALS">Expiring Trial Providers</option>
                    <option value="ALL_CUSTOMERS">All Customers</option>
                    <option value="ALL_USERS">Entire Platform (All Users)</option>
                  </select>
                </div>

                <div>
                  <label className="label mb-1">Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surge Demand in Shivamogga!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="label mb-1">Message Body</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write announcement details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                    {loading ? "Sending..." : "Send Broadcast"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
