"use client";
import Link from "next/link";
import { calculateProfileCompleteness, ProviderProfileForCompleteness } from "@/lib/completeness";

interface ProfileCompletenessCardProps {
  profile: ProviderProfileForCompleteness;
}

export default function ProfileCompletenessCard({ profile }: ProfileCompletenessCardProps) {
  const { score, isFullyComplete, missingItems } = calculateProfileCompleteness(profile);

  if (isFullyComplete) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between text-emerald-950">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-base">
            ✓
          </span>
          <div>
            <span className="font-display text-sm font-bold block">Profile 100% Complete</span>
            <span className="text-xs text-emerald-800">Your profile is fully optimized for maximum lead distribution.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-linear-to-br from-indigo-50/80 via-white to-sky-50/50 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Profile Completeness
          </span>
          <h4 className="font-display text-base font-bold text-slate-900 mt-1">Boost Your Lead Match Priority</h4>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-black text-indigo-900">{score}%</span>
          <span className="text-[10px] uppercase font-bold text-indigo-700 block">Complete</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full rounded-full bg-indigo-100 overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-slate-600 font-medium">
        Complete these missing items to unlock higher lead matching priority and build customer trust:
      </p>

      <div className="space-y-2">
        {missingItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-xl bg-white border border-indigo-100 p-2.5 text-xs">
            <span className="text-slate-800 font-medium flex items-center gap-2">
              <span className="text-amber-500 font-bold">!</span> {item.label}
            </span>
            <Link href={item.actionUrl} className="btn btn-ghost text-xs !py-1 !px-2.5 text-indigo-800 font-bold hover:bg-indigo-50">
              Fix →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
