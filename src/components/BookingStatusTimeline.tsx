"use client";

interface StatusHistoryItem {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  createdAt: string | Date;
  note?: string | null;
}

interface BookingStatusTimelineProps {
  currentStatus: string;
  history?: StatusHistoryItem[];
}

const STAGES = [
  { status: "SUBMITTED", label: "Requested", icon: "📝" },
  { status: "ACCEPTED", label: "Accepted", icon: "🤝" },
  { status: "EN_ROUTE", label: "En Route", icon: "🚗" },
  { status: "IN_PROGRESS", label: "In Progress", icon: "🛠️" },
  { status: "COMPLETED", label: "Completed", icon: "✅" },
];

export default function BookingStatusTimeline({ currentStatus, history = [] }: BookingStatusTimelineProps) {
  const getTimestamp = (status: string) => {
    const item = history.find((h) => h.toStatus === status);
    if (!item) return null;
    return new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getStageIndex = (status: string) => {
    if (status === "MATCHING") return 0;
    if (status === "ASSIGNED") return 0;
    if (status === "ARRIVED_NEARBY" || status === "ARRIVED") return 2;
    if (status === "COMPLETION_REVIEW") return 3;
    const idx = STAGES.findIndex((s) => s.status === status);
    return idx >= 0 ? idx : 0;
  };

  const currentIdx = getStageIndex(currentStatus);

  if (currentStatus === "CANCELLED" || currentStatus === "EXPIRED") {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center">
        <span className="text-xl">⚠️</span>
        <p className="text-xs font-bold text-slate-700 mt-1 uppercase">Booking {currentStatus}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">This request was {currentStatus.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h4 className="font-display text-sm font-bold text-slate-900">Booking Status Timeline</h4>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Live Status
        </span>
      </div>

      <div className="relative flex items-center justify-between px-2">
        {/* Progress Bar background */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute left-6 top-4 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIdx / (STAGES.length - 1)) * 88}%` }}
        />

        {STAGES.map((s, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const time = getTimestamp(s.status);

          return (
            <div key={s.status} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs transition-all ${
                  isCurrent
                    ? "bg-emerald-600 text-white font-bold ring-4 ring-emerald-100 shadow-sm"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                {isDone ? s.icon : "•"}
              </div>

              <span className={`text-[11px] font-bold mt-2 ${isDone ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </span>

              {time ? (
                <span className="text-[10px] font-mono font-semibold text-slate-500 mt-0.5">{time}</span>
              ) : (
                <span className="text-[10px] text-slate-300 mt-0.5">--:--</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
