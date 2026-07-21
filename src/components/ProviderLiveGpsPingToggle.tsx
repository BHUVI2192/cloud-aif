"use client";
import { useState, useEffect } from "react";

interface ProviderLiveGpsPingToggleProps {
  requestId: string;
  status: string;
}

export default function ProviderLiveGpsPingToggle({ requestId, status }: ProviderLiveGpsPingToggleProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendPing = (lat: number, lng: number, speed?: number | null, heading?: number | null) => {
    fetch(`/api/requests/${requestId}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng, speed, heading }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLastPingTime(new Date().toLocaleTimeString());
        }
      })
      .catch(() => {
        // Ignore network errors in ping loop
      });
  };

  useEffect(() => {
    let watchId: number | null = null;

    if (isTracking && typeof window !== "undefined" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          sendPing(pos.coords.latitude, pos.coords.longitude, pos.coords.speed, pos.coords.heading);
        },
        (err) => {
          setErrorMsg(err.message || "Failed to get location");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, requestId]);

  const activeStatuses = ["EN_ROUTE", "ARRIVED_NEARBY", "ARRIVED", "IN_PROGRESS"];
  if (!activeStatuses.includes(status)) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isTracking ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span className="text-xs font-bold text-slate-800">
            {isTracking ? "Live GPS Location Sharing Active" : "GPS Location Sharing Inactive"}
          </span>
        </div>

        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`btn text-xs !py-1.5 !px-3 ${
            isTracking ? "bg-red-600 text-white hover:bg-red-700" : "btn-primary"
          }`}
        >
          {isTracking ? "Stop Sharing Location" : "Start Live GPS Sharing"}
        </button>
      </div>

      {lastPingTime && (
        <p className="text-[11px] text-slate-500">Last GPS Ping: <strong>{lastPingTime}</strong></p>
      )}
      {errorMsg && (
        <p className="text-[11px] font-bold text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
