"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LeadNotificationCardProps {
  assignment: {
    id: string;
    status: string;
    createdAt: string | Date;
    request: {
      id: string;
      title: string;
      category: { name: string };
      subservice?: { name: string } | null;
      serviceArea?: { name: string } | null;
      locality?: string | null;
      urgency: string;
      description: string;
    };
  };
  responseWindowMinutes?: number; // default 15 min for normal, 5 min for emergency
}

export default function LeadNotificationCard({ assignment, responseWindowMinutes = 15 }: LeadNotificationCardProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const createdAtMs = new Date(assignment.createdAt).getTime();
    const windowMs = (assignment.request.urgency === "EMERGENCY" ? 5 : responseWindowMinutes) * 60 * 1000;
    const expiresAtMs = createdAtMs + windowMs;

    const updateTimer = () => {
      const remainingMs = expiresAtMs - Date.now();
      setSecondsLeft(Math.max(0, Math.floor(remainingMs / 1000)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [assignment, responseWindowMinutes]);

  const handleResponse = async (action: "ACCEPT" | "DECLINE") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionTaken(action);
        router.refresh();
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isExpired = secondsLeft <= 0;

  if (actionTaken === "DECLINE") return null;

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-linear-to-br from-amber-50/90 via-white to-orange-50/40 p-5 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            Incoming Lead Offer
          </span>
        </div>

        {/* Live Response Countdown Timer */}
        <div className="text-right">
          <div className={`font-mono text-lg font-black tracking-tight ${isExpired ? "text-red-600" : "text-amber-900"}`}>
            {isExpired ? "00:00" : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`}
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700 block">
            {isExpired ? "Offer Expired" : "Time to Respond"}
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-display text-base font-bold text-slate-900">{assignment.request.title}</h4>
        <p className="text-xs text-slate-600 font-medium">
          {assignment.request.category.name}
          {assignment.request.subservice ? ` · ${assignment.request.subservice.name}` : ""} ·{" "}
          {assignment.request.serviceArea?.name || assignment.request.locality}
        </p>
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{assignment.request.description}</p>
      </div>

      <div className="flex items-center justify-between border-t border-amber-200 pt-3">
        <span className="text-xs font-bold text-slate-700">
          Urgency: <strong className="text-amber-900 font-black">{assignment.request.urgency}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleResponse("DECLINE")}
            disabled={loading || isExpired}
            className="btn btn-ghost text-xs !py-1.5 !px-3 border border-slate-300 text-slate-700"
          >
            Decline
          </button>
          <button
            onClick={() => handleResponse("ACCEPT")}
            disabled={loading || isExpired}
            className="btn btn-primary text-xs !py-2 !px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            {loading ? "Accepting..." : "Accept Lead Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
