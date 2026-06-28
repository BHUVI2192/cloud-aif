"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Area = { id: string; name: string };

function MapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
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
        <span className="text-[12px] font-mono" style={{ color: "var(--forest)" }}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[250px] rounded-xl overflow-hidden relative"
        style={{
          border: "1px solid var(--line)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
          zIndex: 1
        }}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-[12px] flex items-center" style={{ color: "var(--slate)" }}>Quick landmarks:</span>
        {landmarks.map((lm) => (
          <button
            key={lm.name}
            type="button"
            className="text-[12px] px-2 py-0.5 rounded bg-white border hover:bg-gray-50 active:bg-gray-100"
            style={{ borderColor: "var(--line)", color: "var(--forest)" }}
            onClick={() => {
              onChange(lm.lat, lm.lng);
              if (markerRef.current) {
                if ((window as any).google) {
                  const googleObj = (window as any).google;
                  const pos = new googleObj.maps.LatLng(lm.lat, lm.lng);
                  markerRef.current.setPosition(pos);
                  markerRef.current.getMap()?.panTo(pos);
                } else if ((window as any).L) {
                  markerRef.current.setLatLng([lm.lat, lm.lng]);
                }
              }
            }}
          >
            {lm.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RequestForm({
  categoryId,
  categorySlug,
  subserviceId,
  subserviceName,
  areas,
}: {
  categoryId: string;
  categorySlug: string;
  subserviceId: string;
  subserviceName: string;
  areas: Area[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: `${subserviceName} needed`,
    description: "",
    serviceAreaId: "",
    addressLine: "",
    preferredDate: "",
    urgency: "FLEXIBLE",
    contactPreference: "ANY",
    budgetMin: "",
    budgetMax: "",
    phone: "",
    alternatePhone: "",
    latitude: 13.9299,
    longitude: 75.5681,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);

  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 4) e.title = "Add a short title.";
    if (form.description.trim().length < 10) e.description = "Describe the job in a bit more detail.";
    if (!form.serviceAreaId) e.serviceAreaId = "Choose your locality.";
    if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Provide a valid 10-digit primary phone number.";
    if (form.alternatePhone.trim() && !/^\d{10}$/.test(form.alternatePhone.trim())) {
      e.alternatePhone = "Provide a valid 10-digit alternate phone number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        categoryId,
        subserviceId,
        latitude: parseFloat(form.latitude.toString()),
        longitude: parseFloat(form.longitude.toString()),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      const data = await res.json();
      setDone({ id: data.id });
    } else {
      setErrors({ form: "Something went wrong. Please try again." });
    }
  }

  if (done) {
    return (
      <div className="card text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-[26px]" style={{ background: "var(--mist)", color: "var(--brand)" }}>✓</div>
        <h2 className="text-[24px]">Request submitted</h2>
        <p className="mx-auto mb-6 mt-2 max-w-[34em] text-[15px]" style={{ color: "var(--slate)" }}>
          Your request is in. We&apos;ll match a verified provider and you can track progress anytime.
        </p>
        <div className="flex justify-center gap-3">
          <button className="btn btn-primary" onClick={() => router.push(`/request/${done.id}`)}>View request</button>
          <button className="btn btn-ghost" onClick={() => router.push(`/services/${categorySlug}`)}>Back to category</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4 pb-24 md:pb-6 bg-white border border-line" style={{ borderRadius: "20px" }}>
      <Field label="Title" error={errors.title}>
        <input className={`input text-[14px] ${errors.title ? "input-error" : ""}`} value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <Field label="Describe what you need" error={errors.description}>
        <textarea className={`input min-h-[110px] text-[14px] ${errors.description ? "input-error" : ""}`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Two ceiling fans to install and one switchboard that trips frequently." />
      </Field>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Locality" error={errors.serviceAreaId}>
          <select className={`input text-[14px] ${errors.serviceAreaId ? "input-error" : ""}`} value={form.serviceAreaId} onChange={(e) => set("serviceAreaId", e.target.value)}>
            <option value="">Select locality…</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Preferred date">
          <input type="date" className="input text-[14px]" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} />
        </Field>
      </div>

      <Field label="Address / landmark">
        <input className="input text-[14px]" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="House number, Street name, Near Landmark" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary Contact Number" error={errors.phone}>
          <input type="tel" inputMode="numeric" className={`input text-[14px] ${errors.phone ? "input-error" : ""}`} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile number" />
        </Field>
        <Field label="Alternate Contact Number (optional)" error={errors.alternatePhone}>
          <input type="tel" inputMode="numeric" className={`input text-[14px] ${errors.alternatePhone ? "input-error" : ""}`} value={form.alternatePhone} onChange={(e) => set("alternatePhone", e.target.value)} placeholder="Alternate mobile number" />
        </Field>
      </div>

      {/* Embedded Map Pin Picker */}
      <MapPicker
        latitude={form.latitude}
        longitude={form.longitude}
        onChange={(lat, lng) => {
          set("latitude", lat);
          set("longitude", lng);
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Urgency">
          <select className="input text-[14px]" value={form.urgency} onChange={(e) => set("urgency", e.target.value)}>
            <option value="FLEXIBLE">Flexible</option>
            <option value="WITHIN_WEEK">Within a week</option>
            <option value="WITHIN_48_HOURS">Within 48 hours</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </Field>
        <Field label="Preferred contact">
          <select className="input text-[14px]" value={form.contactPreference} onChange={(e) => set("contactPreference", e.target.value)}>
            <option value="ANY">Any</option>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Budget min (₹, optional)">
          <input type="number" inputMode="numeric" className="input text-[14px]" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} />
        </Field>
        <Field label="Budget max (₹, optional)">
          <input type="number" inputMode="numeric" className="input text-[14px]" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
        </Field>
      </div>

      {errors.form && <p className="text-[13px]" style={{ color: "#a32d2d" }}>{errors.form}</p>}
      
      <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0 md:mt-4">
        <button className="btn btn-primary w-full shadow-md md:shadow-none" disabled={submitting} onClick={submit}>
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-[12px]" style={{ color: "#a32d2d" }}>{error}</p>}
    </div>
  );
}
