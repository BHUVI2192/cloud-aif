"use client";
import { useState, useEffect } from "react";

interface CustomerLiveTrackingMapProps {
  requestId: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
}

export default function CustomerLiveTrackingMap({ requestId, destinationLat, destinationLng }: CustomerLiveTrackingMapProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/tracking`);
      const json = await res.json();
      if (res.ok && json.trackingActive) {
        setData(json);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [requestId]);

  if (loading) return null;
  if (!data || !data.trackingActive) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-emerald-500 bg-slate-200">
            {data.providerImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.providerImage} alt={data.providerName} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-bold text-slate-600">👤</span>
            )}
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-emerald-950">{data.providerName} is on the way</h4>
            <p className="text-xs text-emerald-700 font-medium">
              {data.status === "ARRIVED_NEARBY" ? "Arrived nearby (within 200m)" : data.status === "ARRIVED" ? "Arrived at location" : "En route to your location"}
            </p>
          </div>
        </div>

        {data.estimatedEtaMinutes !== null && (
          <div className="text-right">
            <span className="font-display text-2xl font-black text-emerald-800">{data.estimatedEtaMinutes} min</span>
            <p className="text-[10px] uppercase font-bold text-emerald-600">Estimated Arrival</p>
          </div>
        )}
      </div>

      {/* Map Display Box */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl border border-emerald-300 bg-slate-100">
        <iframe
          title="Technician Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          src={`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`}
        />
        {data.isStale && (
          <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-amber-500/90 px-3 py-1 text-center text-xs font-bold text-white backdrop-blur-xs">
            ⚠️ Provider location signal stale (last updated &gt; 5 min ago)
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
        <span>Distance: <strong className="text-slate-900 font-bold">{data.distanceKm !== null ? `${data.distanceKm} km` : "Calculating..."}</strong></span>
        {data.providerPhone && (
          <a href={`tel:${data.providerPhone}`} className="text-emerald-700 font-bold hover:underline">
            📞 Call Provider
          </a>
        )}
      </div>
    </div>
  );
}
