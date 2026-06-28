"use client";
import { useState } from "react";

export default function SupportForm() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !subject || !message) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(true);
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message.");
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please check your connection.");
    }
  }

  if (success) {
    return (
      <div className="card text-center p-8 space-y-3 bg-white border border-line" style={{ borderRadius: "20px" }}>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-[26px]" style={{ background: "var(--mist)", color: "var(--brand)" }}>✓</div>
        <h3 className="text-[20px] font-bold text-slate-900">Message sent!</h3>
        <p className="text-[14px] text-slate-500 max-w-[28em] mx-auto">
          Thanks for reaching out. Our support team will review your inquiry and get back to you shortly at your email.
        </p>
        <button className="btn btn-ghost !mt-4" onClick={() => setSuccess(false)}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 space-y-4 bg-white border border-line animate-fade-in" style={{ borderRadius: "20px" }}>
      <h2 className="text-[20px] font-bold text-slate-900">Send us a message</h2>
      
      {error && (
        <div className="card !p-4 !bg-[#fdf2f2] !border-[#fbd5d5] text-[14px]" style={{ color: "#a32d2d" }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">Your Email</label>
          <input
            type="email"
            className="input text-[14px]"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="label">Subject</label>
          <input
            type="text"
            className="input text-[14px]"
            placeholder="How can we help you?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea
            className="input min-h-[120px] text-[14px]"
            placeholder="Type your message details here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
