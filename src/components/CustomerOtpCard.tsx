"use client";
import { useState, useEffect } from "react";

interface CustomerOtpCardProps {
  requestId: string;
}

export default function CustomerOtpCard({ requestId }: CustomerOtpCardProps) {
  const [otp, setOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOtpState = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GET" }),
      });
      const data = await res.json();
      if (data.isVerified) {
        setIsVerified(true);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchOtpState();
  }, [requestId]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGenerateOtp = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE" }),
      });
      const data = await res.json();
      if (res.ok && data.otp) {
        setOtp(data.otp);
        setResendCooldown(45);
      } else {
        setErrorMsg(data.error || "Failed to generate OTP");
      }
    } catch {
      setErrorMsg("Network error generating OTP");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-lg">
            ✓
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-emerald-950">Job Start Verified</h4>
            <p className="text-xs text-emerald-700">Service has started at your location.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display text-base font-bold text-blue-950">Job Start Security OTP</h4>
          <p className="text-xs text-blue-700">Share this code with your provider when they arrive to start the service.</p>
        </div>
      </div>

      {otp ? (
        <div className="my-4 rounded-xl bg-white p-4 text-center border border-blue-200 shadow-inner">
          <div className="font-mono text-3xl font-black tracking-[0.3em] text-blue-900">{otp}</div>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Valid for 5 minutes • One-time use</p>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerateOtp}
          disabled={loading || resendCooldown > 0}
          className="btn btn-primary text-xs !py-2.5 !px-4"
        >
          {loading ? "Generating..." : otp ? (resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend OTP") : "Show Security OTP"}
        </button>
        {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}
      </div>
    </div>
  );
}
