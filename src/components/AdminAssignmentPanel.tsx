"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Provider {
  id: string;
  legalName: string;
  displayName: string;
  experienceYears: number;
  ratingAverage: number;
  jobsCompleted: number;
  user: {
    email: string;
  };
  assignments: Array<{
    status: string;
  }>;
}

interface AdminAssignmentPanelProps {
  requestId: string;
  providers: Provider[];
}

export default function AdminAssignmentPanel({ requestId, providers }: AdminAssignmentPanelProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  async function assignProvider(providerId: string) {
    setLoadingId(providerId);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setToastMsg(data.error || "Failed to assign provider.");
      }
    } catch {
      setToastMsg("An error occurred.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="card mt-6">
      <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
        Admin Matchmaking Panel
      </h2>
      {providers.length === 0 ? (
        <p className="text-[14px]" style={{ color: "var(--slate)" }}>
          No approved, active service providers match this request&apos;s category/subservice and location in Shivamogga.
        </p>
      ) : (
        <div className="divide-y divide-line">
          {providers.map((p) => {
            const assignment = p.assignments[0];
            const isAssigned = !!assignment;
            
            return (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>
                    {p.displayName} <span className="text-[12px] font-normal" style={{ color: "var(--slate)" }}>({p.user.email})</span>
                  </div>
                  <div className="text-[13px]" style={{ color: "var(--slate)" }}>
                    ★ {p.ratingAverage.toFixed(1)} · {p.experienceYears} yrs exp · {p.jobsCompleted} completed jobs
                  </div>
                </div>

                <div>
                  {isAssigned ? (
                    <span className="badge capitalize">
                      {assignment.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary !py-1.5 !px-3.5 !text-[13px]"
                      disabled={loadingId !== null}
                      onClick={() => assignProvider(p.id)}
                    >
                      {loadingId === p.id ? "Assigning…" : "Assign"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#14331f] text-white px-5 py-3 rounded-xl shadow-xl text-[13px] font-semibold animate-slide-up flex items-center gap-2 border border-emerald/20 min-w-[280px] justify-between">
          <div className="flex items-center gap-2">
            <span>ℹ️</span>
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-[16px] font-bold opacity-80 hover:opacity-100 pl-3">×</button>
        </div>
      )}
    </div>
  );
}
