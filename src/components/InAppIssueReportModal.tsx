"use client";
import { useState } from "react";

interface InAppIssueReportModalProps {
  requestId?: string;
  providerId?: string;
}

export default function InAppIssueReportModal({ requestId, providerId }: InAppIssueReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("SERVICE_QUALITY");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          providerId,
          type,
          subject,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit issue");
      }

      setSubmitted(true);
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
        className="btn btn-ghost text-xs text-rose-700 hover:text-rose-900 border border-rose-200 bg-rose-50/50 hover:bg-rose-50"
      >
        ⚠️ Report Service Issue
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <span>⚠️</span> Report Service Issue
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-4xl">✅</span>
                <h4 className="font-display text-base font-bold text-slate-900">Issue Ticket Raised</h4>
                <p className="text-xs text-slate-600">
                  Ogenzo Support has received your ticket and will contact you within 2 hours.
                </p>
                <button onClick={() => setIsOpen(false)} className="btn btn-primary text-xs">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-200">{error}</div>}

                <div>
                  <label className="label mb-1">Issue Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold"
                  >
                    <option value="SERVICE_QUALITY">Service Quality Issue</option>
                    <option value="DELAY_UNPUNCTUAL">Provider Delay / No Show</option>
                    <option value="PRICING_DISPUTE">Pricing / Payment Dispute</option>
                    <option value="DAMAGE">Property Damage</option>
                    <option value="BEHAVIOR">Unprofessional Behavior</option>
                  </select>
                </div>

                <div>
                  <label className="label mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary of what went wrong..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="label mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details so our Shivamogga resolution team can investigate..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold">
                    {loading ? "Submitting..." : "Submit Complaint Ticket"}
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
