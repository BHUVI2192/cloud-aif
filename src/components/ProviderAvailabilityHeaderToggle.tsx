"use client";
import { useState, useEffect } from "react";

type AvailabilityMode = "ONLINE" | "OFFLINE" | "ON_BREAK";

export default function ProviderAvailabilityHeaderToggle() {
  const [mode, setMode] = useState<AvailabilityMode>("ONLINE");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialMode() {
      try {
        const res = await fetch("/api/provider/availability-mode");
        if (res.ok) {
          const data = await res.json();
          if (data.availabilityMode) {
            setMode(data.availabilityMode);
          }
        }
      } catch (err) {
        console.error("Error fetching initial availability mode:", err);
      }
    }
    fetchInitialMode();
  }, []);

  const handleModeChange = async (newMode: AvailabilityMode) => {
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
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AvailabilityMode) => {
    if (status === "ONLINE") return "bg-secondary"; // Deep Teal
    if (status === "ON_BREAK") return "bg-tertiary"; // Areca Earth
    return "bg-inverse-surface"; // Neutral Dark Charcoal
  };

  return (
    <div className="flex flex-col items-stretch gap-1 w-full max-w-[280px] sm:max-w-xs shrink-0">
      <div className="flex h-11 items-center justify-between bg-surface-container border border-outline-variant rounded p-1">
        <button
          type="button"
          onClick={() => handleModeChange("ONLINE")}
          disabled={loading}
          className={`flex-1 h-full text-[12px] font-extrabold uppercase tracking-wide rounded-sm flex items-center justify-center gap-1.5 transition-all select-none ${
            mode === "ONLINE"
              ? "bg-[#046b5e] text-white shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${mode === "ONLINE" ? "bg-white animate-pulse" : "bg-secondary"}`} />
          ONLINE
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("ON_BREAK")}
          disabled={loading}
          className={`flex-1 h-full text-[12px] font-extrabold uppercase tracking-wide rounded-sm flex items-center justify-center gap-1.5 transition-all select-none ${
            mode === "ON_BREAK"
              ? "bg-[#5d4037] text-white shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${mode === "ON_BREAK" ? "bg-white" : "bg-tertiary"}`} />
          BREAK
        </button>

        <button
          type="button"
          onClick={() => handleModeChange("OFFLINE")}
          disabled={loading}
          className={`flex-1 h-full text-[12px] font-extrabold uppercase tracking-wide rounded-sm flex items-center justify-center gap-1.5 transition-all select-none ${
            mode === "OFFLINE"
              ? "bg-[#263238] text-white shadow-2xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${mode === "OFFLINE" ? "bg-white" : "bg-on-surface-variant"}`} />
          OFFLINE
        </button>
      </div>

      {errorMsg && (
        <span className="text-[10px] text-error font-extrabold px-1 text-center truncate">
          ⚠️ {errorMsg}
        </span>
      )}
    </div>
  );
}
