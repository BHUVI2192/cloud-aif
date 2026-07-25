"use client";
import { useEffect, useRef } from "react";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    let cssLink: HTMLLinkElement | null = null;

    const initializeLeaflet = () => {
      if (!mapRef.current || !(window as any).L) return;

      const L = (window as any).L;

      // Clean up previous map instance to prevent duplicate initialization error
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([latitude, longitude], 14);

      mapInstanceRef.current = map;

      // Load OSM tile layer with exact zoom template parameter {z}
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon using divIcon (bulletproof emoji structure, no PNG asset load needed)
      const pinIcon = L.divIcon({
        className: "custom-pin-icon",
        html: `<div style="font-size: 26px; background: white; border: 2px solid var(--forest); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2)">📍</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      // Add draggable marker
      const marker = L.marker([latitude, longitude], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      markerInstanceRef.current = marker;

      // Click to move pin
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng(e.latlng);
        onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
      });

      // Drag to move pin
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        if (pos) {
          onChange(parseFloat(pos.lat.toFixed(6)), parseFloat(pos.lng().toFixed(6)));
        }
      });

      // Force layout update to prevent partial rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    };

    // Load CSS dynamically
    cssLink = document.getElementById("leaflet-css") as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement("link");
      cssLink.id = "leaflet-css";
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);
    }

    // Load JS script dynamically
    script = document.getElementById("leaflet-js") as HTMLScriptElement;
    if (!(window as any).L) {
      if (!script) {
        script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", initializeLeaflet);
    } else {
      initializeLeaflet();
    }

    return () => {
      if (script) {
        script.removeEventListener("load", initializeLeaflet);
      }
    };
  }, []);

  // Update marker & pan map if coordinates change externally (such as landmark clicks)
  useEffect(() => {
    if (markerInstanceRef.current && mapInstanceRef.current) {
      const pos = [latitude, longitude];
      markerInstanceRef.current.setLatLng(pos);
      mapInstanceRef.current.panTo(pos);
    }
  }, [latitude, longitude]);

  const landmarks = [
    { name: "Gandhi Bazar", lat: 13.9312, lng: 75.5695 },
    { name: "Shivamogga Bus Stand", lat: 13.9285, lng: 75.5658 },
    { name: "Gopi Circle", lat: 13.9333, lng: 75.5684 },
    { name: "Sominakoppa", lat: 13.9512, lng: 75.5487 },
    { name: "Tunga River Bridge", lat: 13.9220, lng: 75.5800 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="label">Pin Location (Drag marker or click on map to move pin)</label>
        <span className="text-[12px] font-mono text-forest">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 py-1">
        {landmarks.map((l) => (
          <button
            key={l.name}
            type="button"
            onClick={() => onChange(l.lat, l.lng)}
            className="px-2.5 py-1 text-[11px] rounded bg-surface border border-outline-variant hover:border-primary transition text-on-surface font-semibold"
          >
            📍 {l.name}
          </button>
        ))}
      </div>

      <div
        ref={mapRef}
        className="h-[240px] w-full rounded-2xl border border-outline-variant bg-surface-container shadow-inner overflow-hidden z-10 relative"
      />
    </div>
  );
}
