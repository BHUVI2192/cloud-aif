"use client";
import { useState, useEffect } from "react";

export default function ProviderAvailabilityHeaderToggle() {
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE" | "ON_BREAK">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleModeChange = async (newMode: "ONLINE" | "OFFLINE" | "ON_BREAK") => {
    if (newMode === mode) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/provider/availability-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      const data = await res.json();
      if (res.ok && data.availabilityMode) {
        setMode(data.availabilityMode);
      } else {
        setErrorMsg(data.error || "Failed to update mode");
      }
    } catch {
      setErrorMsg("Network error updating mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
      <button
        onClick={() => handleModeChange("ONLINE")}
        disabled={loading}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 ${
          mode === "ONLINE"
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        Online
      </button>
      <button
        onClick={() => handleModeChange("ON_BREAK")}
        disabled={loading}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 ${
          mode === "ON_BREAK"
            ? "bg-amber-500 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-amber-200" />
        Break
      </button>
      <button
        onClick={() => handleModeChange("OFFLINE")}
        disabled={loading}
        className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all flex items-center gap-1 ${
          mode === "OFFLINE"
            ? "bg-slate-700 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Offline
      </button>
      {errorMsg && (
        <span className="text-[10px] text-red-500 font-bold px-1">{errorMsg}</span>
      )}
    </div>
  );
}
