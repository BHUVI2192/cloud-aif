"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewBox({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (rating < 1) { setError("Please pick a rating."); return; }
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, rating, comment }),
    });
    setSubmitting(false);
    if (res.ok) router.refresh();
    else setError("Could not submit review.");
  }

  return (
    <div>
      <p className="label">Leave a review</p>
      <div className="mb-2 flex gap-1 text-[26px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} style={{ color: n <= rating ? "var(--emerald)" : "var(--line)" }}>★</button>
        ))}
      </div>
      <textarea className="input min-h-[80px]" placeholder="How was the service?" value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <p className="mt-1 text-[12px]" style={{ color: "#a32d2d" }}>{error}</p>}
      <button className="btn btn-primary mt-3" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit review"}</button>
    </div>
  );
}
