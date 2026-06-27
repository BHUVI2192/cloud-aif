"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DayOfWeek } from "@prisma/client";

interface Slot {
  id?: string;
  dayOfWeek: DayOfWeek | null;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ProviderAvailabilityFormProps {
  initialSlots: Slot[];
}

const DAYS: DayOfWeek[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function ProviderAvailabilityForm({ initialSlots }: ProviderAvailabilityFormProps) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Record<DayOfWeek, { active: boolean; start: string; end: string }>>(() => {
    const s: Record<DayOfWeek, { active: boolean; start: string; end: string }> = {} as any;
    DAYS.forEach((d) => {
      const match = initialSlots.find((x) => x.dayOfWeek === d);
      s[d] = {
        active: !!match,
        start: match?.startTime ?? "09:00",
        end: match?.endTime ?? "17:00",
      };
    });
    return s;
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function handleToggle(day: DayOfWeek) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  }

  function handleTimeChange(day: DayOfWeek, field: "start" | "end", val: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: val },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Format active slots for the API
    const activeSlots = DAYS.filter((d) => schedule[d].active).map((d) => ({
      dayOfWeek: d,
      startTime: schedule[d].start,
      endTime: schedule[d].end,
    }));

    try {
      const res = await fetch("/api/provider/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots: activeSlots }),
      });

      if (res.ok) {
        setMessage({ text: "Weekly availability updated successfully!", error: false });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to update availability.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred. Please try again.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="card max-w-[640px] space-y-4">
      <h2 className="text-[18px] font-semibold mb-2" style={{ color: "var(--forest)" }}>
        Weekly Hours
      </h2>
      <p className="text-[14px] mb-4" style={{ color: "var(--slate)" }}>
        Select your active working days and define your business hours.
      </p>

      <div className="space-y-3">
        {DAYS.map((d) => {
          const config = schedule[d];
          return (
            <div key={d} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-0" style={{ borderColor: "var(--line)" }}>
              <label className="flex items-center gap-2 cursor-pointer font-semibold capitalize" style={{ color: "var(--forest)" }}>
                <input
                  type="checkbox"
                  className="accent-emerald"
                  checked={config.active}
                  onChange={() => handleToggle(d)}
                  disabled={loading}
                />
                {d.toLowerCase()}
              </label>

              {config.active ? (
                <div className="flex items-center gap-2 text-[14px]">
                  <input
                    type="time"
                    className="input !py-1 !px-2 w-28"
                    value={config.start}
                    onChange={(e) => handleTimeChange(d, "start", e.target.value)}
                    disabled={loading}
                  />
                  <span style={{ color: "var(--slate)" }}>to</span>
                  <input
                    type="time"
                    className="input !py-1 !px-2 w-28"
                    value={config.end}
                    onChange={(e) => handleTimeChange(d, "end", e.target.value)}
                    disabled={loading}
                  />
                </div>
              ) : (
                <span className="text-[13px]" style={{ color: "var(--slate)" }}>
                  Unavailable
                </span>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <p
          className="text-[14px] font-semibold"
          style={{ color: message.error ? "#a32d2d" : "var(--emerald)" }}
        >
          {message.text}
        </p>
      )}

      <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
        {loading ? "Saving Hours…" : "Save Weekly Hours"}
      </button>
    </form>
  );
}
