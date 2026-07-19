"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

interface Customer {
  name: string | null;
}

interface Category {
  name: string;
}

interface Subservice {
  name: string;
}

interface ServiceArea {
  name: string;
}

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  preferredDate: string | null;
  preferredTime: string | null;
  locality: string | null;
  addressLine: string | null;
  landmark: string | null;
  phone: string | null;
  status: string;
  customer: Customer;
  category: Category;
  subservice: Subservice | null;
  serviceArea: ServiceArea | null;
}

interface Assignment {
  id: string;
  status: string;
  requestId: string;
  assignedAt: string;
  request: RequestDetail;
}

interface ProviderCalendarClientProps {
  assignments: Assignment[];
}

export default function ProviderCalendarClient({ assignments }: ProviderCalendarClientProps) {
  const { language } = useLanguage();
  const isKn = language === "kn";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateISO, setSelectedDateISO] = useState<string>("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based

  // Set initial selected date to today
  useEffect(() => {
    setSelectedDateISO(new Date().toISOString().split("T")[0]);
  }, []);

  // Handlers for month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const daysGrid: (Date | null)[] = [];

  // Padding cells for days of prev month
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }

  // Actual days of the month
  for (let d = 1; d <= totalDaysInMonth; d++) {
    daysGrid.push(new Date(currentYear, currentMonth, d));
  }

  // Filter jobs for selected day
  const dailyJobs = assignments.filter((a) => {
    if (!a.request.preferredDate) return false;
    const dateStr = a.request.preferredDate.split("T")[0];
    return dateStr === selectedDateISO;
  });

  const monthLabel = currentDate.toLocaleDateString(isKn ? "kn-IN" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const weekdays = isKn 
    ? ["ಭಾನು", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Calendar Grid Container */}
      <div className="card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: "var(--line)" }}>
          <h2 className="text-[17px] font-bold text-forest capitalize">
            📅 {monthLabel}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 border rounded-xl hover:bg-mist text-[14px] font-bold text-slate transition"
              style={{ borderColor: "var(--line)", minWidth: "40px" }}
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 border rounded-xl hover:bg-mist text-[12px] font-bold text-slate transition"
              style={{ borderColor: "var(--line)" }}
            >
              {isKn ? "ಇಂದು" : "Today"}
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border rounded-xl hover:bg-mist text-[14px] font-bold text-slate transition"
              style={{ borderColor: "var(--line)", minWidth: "40px" }}
            >
              ▶
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-[12px] font-bold text-slate/70 mb-2">
          {weekdays.map((wd, i) => (
            <div key={i} className="py-1">{wd}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 border-t pt-1" style={{ borderColor: "var(--line)" }}>
          {daysGrid.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/50 rounded-xl" />;
            }

            const iso = dateObj.toISOString().split("T")[0];
            const isSelected = selectedDateISO === iso;
            const isToday = new Date().toISOString().split("T")[0] === iso;
            const dayNum = dateObj.getDate();

            // Count jobs on this day
            const dayJobsCount = assignments.filter((a) => {
              if (!a.request.preferredDate) return false;
              return a.request.preferredDate.split("T")[0] === iso;
            }).length;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDateISO(iso)}
                className={`aspect-square flex flex-col justify-between p-1.5 rounded-xl border relative transition-all duration-150 ${
                  isSelected
                    ? "bg-mist border-brand text-brand font-bold"
                    : isToday
                    ? "bg-slate-50 border-emerald/50 text-emerald font-semibold"
                    : "bg-white border-line text-slate hover:border-slate/30"
                }`}
              >
                <span className="text-[13px]">{dayNum}</span>
                
                {/* Tiny workload indicator indicator */}
                {dayJobsCount > 0 && (
                  <span
                    className={`text-[9px] font-extrabold px-1 rounded-md self-stretch text-center truncate ${
                      dayJobsCount > 2
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald/10 text-emerald"
                    }`}
                  >
                    {dayJobsCount} {isKn ? "ಕೆಲಸ" : "Job"}{dayJobsCount > 1 && !isKn ? "s" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Workload & Job Details Panel */}
      <div className="card space-y-4">
        <div className="border-b pb-3" style={{ borderColor: "var(--line)" }}>
          <h3 className="text-[15px] font-bold text-forest">
            ⏰ {isKn ? "ದಿನದ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ವಿವರಗಳು" : "Schedule Details"} ({selectedDateISO})
          </h3>
          <p className="text-[13px] text-slate mt-1">
            {isKn ? `ಒಟ್ಟು ನಿಯೋಜಿತ ಕೆಲಸಗಳು: ` : `Total assignments for this day: `}
            <span className="font-bold text-forest">{dailyJobs.length}</span>
          </p>
        </div>

        {dailyJobs.length === 0 ? (
          <div className="text-center py-6 text-[14px] text-slate/70">
            ⛱️ {isKn ? "ಇಂದು ಯಾವುದೇ ಕೆಲಸಗಳು ನಿಗದಿಯಾಗಿಲ್ಲ." : "No assignments scheduled for today."}
          </div>
        ) : (
          <div className="space-y-4">
            {dailyJobs.map((a) => {
              const req = a.request;
              return (
                <div
                  key={a.id}
                  className="rounded-xl border p-4 hover:shadow-sm transition space-y-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-2" style={{ borderColor: "var(--line)" }}>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate">
                        {req.preferredTime || (isKn ? "ಸಮಯ ನಿಗದಿಯಾಗಿಲ್ಲ" : "No Time Set")}
                      </span>
                      <h4 className="text-[15px] font-bold text-forest mt-1">{req.title}</h4>
                    </div>
                    <span className={`badge text-[11px] font-bold ${
                      a.status === "ACCEPTED" ? "badge-success bg-green-50 text-green-700 border-green-200" :
                      a.status === "COMPLETED" ? "badge-completed bg-blue-50 text-blue-700 border-blue-200" :
                      "badge-pending bg-yellow-50 text-yellow-700 border-yellow-200"
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-[13px] text-slate">
                    <div>
                      <strong className="text-forest">{isKn ? "ಗ್ರಾಹಕರು" : "Customer"}:</strong> {req.customer.name}
                    </div>
                    <div>
                      <strong className="text-forest">{isKn ? "ಸೇವಾ ವಿಭಾಗ" : "Service"}:</strong> {req.category.name} {req.subservice && `· ${req.subservice.name}`}
                    </div>
                    <div>
                      <strong className="text-forest">{isKn ? "ವಿಳಾಸ" : "Address"}:</strong> {req.addressLine}, {req.locality}
                    </div>
                    {req.landmark && (
                      <div>
                        <strong className="text-forest">{isKn ? "ಗುರುತು" : "Landmark"}:</strong> {req.landmark}
                      </div>
                    )}
                    <div>
                      <strong className="text-forest">{isKn ? "ಮೊಬೈಲ್" : "Phone"}:</strong> <a href={`tel:${req.phone}`} className="text-brand font-semibold underline">{req.phone}</a>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1 border-t" style={{ borderColor: "var(--line)" }}>
                    <Link
                      href={`/request/${req.id}`}
                      className="btn btn-ghost !py-1.5 !px-3 !text-[12px] font-bold"
                    >
                      {isKn ? "ಪೂರ್ಣ ವಿವರಗಳು →" : "View Full Details →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
