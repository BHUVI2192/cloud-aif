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
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    let script: HTMLScriptElement | null = null;
    let cssLink: HTMLLinkElement | null = null;

    if (apiKey) {
      // 1. Google Maps Mode
      const initializeGoogleMap = () => {
        if (!mapRef.current || !(window as any).google) return;

        const googleObj = (window as any).google;
        const map = new googleObj.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const marker = new googleObj.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          draggable: true,
        });

        markerRef.current = marker;

        map.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          marker.setPosition(e.latLng);
          onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
        });

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (pos) {
            onChange(parseFloat(pos.lat().toFixed(6)), parseFloat(pos.lng().toFixed(6)));
          }
        });
      };

      script = document.getElementById("google-maps-script") as HTMLScriptElement;
      if (!(window as any).google) {
        if (!script) {
          script = document.createElement("script");
          script.id = "google-maps-script";
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }
        script.addEventListener("load", initializeGoogleMap);
      } else {
        initializeGoogleMap();
      }

      return () => {
        if (script) {
          script.removeEventListener("load", initializeGoogleMap);
        }
      };
    } else {
      // 2. Leaflet / OpenStreetMap Mode (No API Key Required!)
      const initializeLeaflet = () => {
        if (!mapRef.current || !(window as any).L) return;

        const LObj = (window as any).L;
        
        // Clean up previous map if it exists to prevent multiple initializations
        if ((mapRef.current as any)._leaflet_id) {
          return;
        }

        const map = LObj.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([latitude, longitude], 14);

        LObj.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Customize marker icon to match standard Leaflet CDN marker
        const customIcon = LObj.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = LObj.marker([latitude, longitude], {
          draggable: true,
          icon: customIcon,
        }).addTo(map);

        markerRef.current = marker;

        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng(e.latlng);
          onChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
        });

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          if (pos) {
            onChange(parseFloat(pos.lat().toFixed(6)), parseFloat(pos.lng().toFixed(6)));
          }
        });

        // Trigger map layout updates after initialization to fix rendering glitches
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      };

      cssLink = document.getElementById("leaflet-css") as HTMLLinkElement;
      if (!cssLink) {
        cssLink = document.createElement("link");
        cssLink.id = "leaflet-css";
        cssLink.rel = "stylesheet";
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(cssLink);
      }

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
    }
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current) {
      if ((window as any).google) {
        const googleObj = (window as any).google;
        const pos = new googleObj.maps.LatLng(latitude, longitude);
        markerRef.current.setPosition(pos);
        markerRef.current.getMap()?.panTo(pos);
      } else if ((window as any).L) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
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
