"use client";
import { useState } from "react";

export function ProviderReferralCard({
  referralCode,
  providerId,
}: {
  referralCode: string;
  providerId: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/become-a-provider?ref=${referralCode}`
    : `https://cloudaif.in/become-a-provider?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card border border-amber-200 bg-amber-50/50 p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            🎁 Provider Referral Program
          </span>
          <h3 className="text-[17px] font-bold text-gray-900 mt-1">
            Invite local pros & earn free months
          </h3>
          <p className="text-[13px] text-gray-600 mt-0.5">
            Share your unique referral link with fellow plumbers, electricians, or technicians in Shivamogga. Get 1 free subscription month (+30 bonus leads) for every pro who joins!
          </p>
        </div>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="space-y-0.5 overflow-hidden">
          <span className="text-[11px] font-semibold text-slate uppercase tracking-wider">Your Referral Code</span>
          <div className="font-mono font-bold text-[16px] text-forest flex items-center gap-2">
            <span>{referralCode}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={copyToClipboard}
          className="btn btn-primary bg-amber-600 hover:bg-amber-700 text-white border-none text-[13px] font-bold py-2.5 px-4 min-h-[44px] rounded-xl shadow active:scale-95 transition"
        >
          {copied ? "✓ Link Copied!" : "📋 Copy Share Link"}
        </button>
      </div>
    </div>
  );
}
