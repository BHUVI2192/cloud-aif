"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProviderOtpVerifyModalProps {
  requestId: string;
  onSuccess?: () => void;
}

export default function ProviderOtpVerifyModal({ requestId, onSuccess }: ProviderOtpVerifyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter 6-digit OTP code");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY", code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        setErrorMsg(data.error || "Verification failed");
      }
    } catch {
      setErrorMsg("Network error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary text-xs !py-2.5 !px-4 shadow-sm"
      >
        🔑 Start Job (Enter Customer OTP)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-1">Verify Job Start OTP</h3>
            <p className="text-xs text-slate-600 mb-4">Ask customer for the 6-digit verification code displayed on their screen.</p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-300 p-3 text-center font-mono text-2xl font-bold tracking-[0.2em] focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-2 text-center text-xs font-bold text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}

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
                  disabled={loading || code.length !== 6}
                  className="btn btn-primary text-xs !py-2.5 !px-5"
                >
                  {loading ? "Verifying..." : "Verify & Start Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
