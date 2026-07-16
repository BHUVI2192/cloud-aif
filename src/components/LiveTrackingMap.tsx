"use client";
import { useEffect, useRef, useState } from "react";

interface LiveTrackingMapProps {
  latitude: number;
  longitude: number;
  providerName: string;
  landmark?: string | null;
}

export default function LiveTrackingMap({
  latitude,
  longitude,
  providerName,
  landmark,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  
  const [eta, setEta] = useState(15); // Starts at 15 mins
  const [statusText, setStatusText] = useState("Technician accepted job");
  const [stepIndex, setStepIndex] = useState(0);

  // Status steps
  const steps = [
    { text: "Preparing kit & tools", time: 15 },
    { text: "Travelling on bike", time: 10 },
    { text: "Arriving near " + (landmark || "your location"), time: 3 },
    { text: "Arrived at your doorstep!", time: 0 }
  ];

  useEffect(() => {
    // 1. Handle countdown timer and step changes
    const timerInterval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setStepIndex(3);
          setStatusText(steps[3].text);
          return 0;
        }
        const nextTime = prev - 1;
        // Determine matching status step
        if (nextTime <= 3) {
          setStepIndex(2);
          setStatusText(steps[2].text);
        } else if (nextTime <= 10) {
          setStepIndex(1);
          setStatusText(steps[1].text);
        } else {
          setStepIndex(0);
          setStatusText(steps[0].text);
        }
        return nextTime;
      });
    }, 5000); // Speed up for demo purposes (counts down 1 min every 5 seconds)

    // 2. Load Leaflet styles and scripts
    let leafletScript: HTMLScriptElement | null = null;
    let leafletLink: HTMLLinkElement | null = null;

    const initMap = () => {
      if (!mapRef.current || !(window as any).L || mapInstanceRef.current) return;

      const L = (window as any).L;

      // Initialize map instance
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([latitude, longitude], 14);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom bike icon for rider
      const bikeIcon = L.divIcon({
        className: "custom-bike-icon",
        html: `<div style="font-size: 24px; background: white; border: 2px solid var(--brand); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15)">🏍️</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Custom home icon for customer
      const homeIcon = L.divIcon({
        className: "custom-home-icon",
        html: `<div style="font-size: 24px; background: white; border: 2px solid var(--forest); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.15)">🏠</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Customer home marker
      L.marker([latitude, longitude], { icon: homeIcon }).addTo(map)
        .bindPopup("Your Home Location")
        .openPopup();

      // Starting coordinate of rider (0.007 degree away, roughly 800m)
      const startLat = latitude + 0.005;
      const startLng = longitude - 0.005;

      const riderMarker = L.marker([startLat, startLng], { icon: bikeIcon }).addTo(map);
      riderMarkerRef.current = riderMarker;

      // Animate rider coordinate updates
      let progress = 0;
      const animateRider = setInterval(() => {
        progress += 0.01;
        if (progress >= 1.0) {
          clearInterval(animateRider);
          riderMarker.setLatLng([latitude, longitude]);
          return;
        }

        // Linear interpolation towards customer coordinates
        const curLat = startLat + (latitude - startLat) * progress;
        const curLng = startLng + (longitude - startLng) * progress;
        riderMarker.setLatLng([curLat, curLng]);
      }, 300); // Smooth movement
    };

    if (!(window as any).L) {
      // Create CSS link
      leafletLink = document.createElement("link");
      leafletLink.rel = "stylesheet";
      leafletLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(leafletLink);

      // Create JS script
      leafletScript = document.createElement("script");
      leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leafletScript.async = true;
      document.head.appendChild(leafletScript);
      leafletScript.addEventListener("load", initMap);
    } else {
      initMap();
    }

    return () => {
      clearInterval(timerInterval);
      if (leafletScript) leafletScript.removeEventListener("load", initMap);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, landmark]);

  return (
    <div className="card !p-0 overflow-hidden border border-line bg-white shadow-sm mt-5">
      {/* Upper Status Panel */}
      <div className="p-4 bg-emerald-50/60 border-b border-line flex items-center justify-between gap-4">
        <div>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate/80">Technician Status</span>
          <h4 className="text-[15px] font-bold text-forest mt-0.5">{providerName} is coming!</h4>
          <p className="text-[12px] text-slate mt-0.5">{statusText}</p>
        </div>
        <div className="text-right bg-white px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-sm shrink-0">
          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate">ETA</span>
          <span className="text-[18px] font-extrabold text-brand tracking-tight">{eta} <span className="text-[11px] font-bold">mins</span></span>
        </div>
      </div>

      {/* Map Element */}
      <div ref={mapRef} className="w-full h-[250px] bg-slate-100 z-10" />

      {/* Footer Step Timeline */}
      <div className="p-4 bg-[#f8fafc]">
        <div className="flex justify-between items-center relative">
          {/* Progress bar background line */}
          <div className="absolute left-4 right-4 h-1 bg-line top-1/2 -translate-y-1/2 -z-10" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  idx <= stepIndex 
                    ? "bg-brand border-brand text-white shadow-sm"
                    : "bg-white border-line text-slate"
                }`}
              >
                {idx < stepIndex ? "✓" : idx + 1}
              </div>
              <span className={`text-[10px] font-bold hidden sm:block ${idx <= stepIndex ? "text-forest" : "text-slate"}`}>
                {step.text.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
