"use client";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/nav";

export default function AdminDispatchBoard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [newProviderId, setNewProviderId] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchDispatch = async () => {
    try {
      const res = await fetch("/api/admin/dispatch");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatch();
    const interval = setInterval(fetchDispatch, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !newProviderId) return;

    setIsSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequestId,
          newProviderId,
          reason: reassignReason,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMsg("Provider reassigned successfully!");
        setSelectedRequestId(null);
        setNewProviderId("");
        setReassignReason("");
        fetchDispatch();
      } else {
        setMsg(json.error || "Reassignment failed");
      }
    } catch {
      setMsg("Network error reassigning provider");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell
        title="Dispatch Operations Board"
        nav={ADMIN_NAV}
        active="Dispatch Board"
        user={{ name: "Admin", role: "ADMIN" }}
      >
        <div className="p-8 text-center text-xs font-bold text-slate-500">Loading live dispatch metrics...</div>
      </DashboardShell>
    );
  }

  const requests = data?.activeRequests || [];
  const providers = data?.providers || [];

  const filteredRequests = requests.filter((r: any) => {
    if (activeTab === "WAITING_OTP") return ["ARRIVED_NEARBY", "ARRIVED"].includes(r.status);
    if (activeTab === "EN_ROUTE") return r.status === "EN_ROUTE";
    if (activeTab === "COMPLETION_REVIEW") return r.status === "COMPLETION_REVIEW";
    if (activeTab === "SLA_WARNING") return r.needsAdminAttention || r.otp?.attempts > 1;
    return true;
  });

  const onlineProviders = providers.filter((p: any) => p.availabilityMode === "ONLINE");
  const onBreakProviders = providers.filter((p: any) => p.availabilityMode === "ON_BREAK");
  const offlineProviders = providers.filter((p: any) => p.availabilityMode === "OFFLINE");

  return (
    <DashboardShell
      title="Dispatch Operations Board"
      nav={ADMIN_NAV}
      active="Dispatch Board"
      user={{ name: "Admin", role: "ADMIN" }}
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Active Requests</span>
            <span className="font-display text-2xl font-black text-slate-900">{requests.length}</span>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Online Pros</span>
            <span className="font-display text-2xl font-black text-emerald-800">{onlineProviders.length}</span>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">On Break Pros</span>
            <span className="font-display text-2xl font-black text-amber-800">{onBreakProviders.length}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Offline Pros</span>
            <span className="font-display text-2xl font-black text-slate-700">{offlineProviders.length}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b pb-2">
          {[
            { id: "ALL", label: `All Jobs (${requests.length})` },
            { id: "EN_ROUTE", label: "En Route" },
            { id: "WAITING_OTP", label: "Waiting for OTP" },
            { id: "COMPLETION_REVIEW", label: "Completion Review" },
            { id: "SLA_WARNING", label: "⚠️ SLA Warning" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {msg && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs font-bold text-blue-900">
            {msg}
          </div>
        )}

        {/* Request Dispatch Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">Live Service Jobs</h3>

            {filteredRequests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 font-medium">
                No active requests matching filter.
              </div>
            ) : (
              filteredRequests.map((r: any) => {
                const assigned = r.assignments[0]?.provider;
                return (
                  <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 font-mono">#{r.id.slice(-8)}</span>
                        <h4 className="font-display text-base font-bold text-slate-900">{r.title}</h4>
                        <p className="text-xs text-slate-500">{r.category?.name} · {r.serviceArea?.name}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border">
                        {r.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 border-t pt-3">
                      <div>
                        <span>Assigned Pro: </span>
                        <strong className="text-slate-900">{assigned?.displayName || "None"}</strong>
                      </div>

                      <button
                        onClick={() => setSelectedRequestId(r.id)}
                        className="btn btn-ghost text-xs !py-1 !px-2.5 border border-slate-300"
                      >
                        🔄 Reassign Pro
                      </button>
                    </div>

                    {/* Reassign Drawer Form */}
                    {selectedRequestId === r.id && (
                      <form onSubmit={handleReassign} className="mt-3 rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-xs font-semibold text-slate-700">
                        <h5 className="font-bold text-slate-900">Reassign Request #{r.id.slice(-6)}</h5>
                        <div>
                          <label className="block mb-1">Select New Provider</label>
                          <select
                            value={newProviderId}
                            onChange={(e) => setNewProviderId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                          >
                            <option value="">Choose Online Provider...</option>
                            {onlineProviders.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.displayName} (★ {p.ratingAverage.toFixed(1)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block mb-1">Reason for Reassignment</label>
                          <input
                            type="text"
                            value={reassignReason}
                            onChange={(e) => setReassignReason(e.target.value)}
                            placeholder="State dispatch reason..."
                            className="w-full rounded-lg border border-slate-300 p-2 bg-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRequestId(null)}
                            className="btn btn-ghost text-xs !py-1 !px-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !newProviderId}
                            className="btn btn-primary text-xs !py-1.5 !px-3"
                          >
                            {isSubmitting ? "Reassigning..." : "Confirm Reassign"}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Online Providers Sidebar */}
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900">Provider Status Monitor</h3>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              {providers.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.displayName}</span>
                    <p className="text-[11px] text-slate-500">★ {p.ratingAverage.toFixed(1)} · {p.user?.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    p.availabilityMode === "ONLINE" ? "bg-emerald-100 text-emerald-800" : p.availabilityMode === "ON_BREAK" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                  }`}>
                    {p.availabilityMode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
