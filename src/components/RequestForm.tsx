"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: `${subserviceName} needed`,
    description: "",
    serviceAreaId: "",
    addressLine: "",
    landmark: "",
    preferredDate: "",
    urgency: "FLEXIBLE",
    contactPreference: "ANY",
    budgetMin: "",
    budgetMax: "",
    phone: "",
    alternatePhone: "",
    latitude: 13.9299,
    longitude: 75.5681,
    voiceNoteUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [aiTriaging, setAiTriaging] = useState(false);

  // Audio recording state
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);

        // Immediately upload to server
        setUploadingVoice(true);
        try {
          const data = new FormData();
          data.append("file", blob, "voice-note.webm");
          const response = await fetch("/api/upload-voice", {
            method: "POST",
            body: data,
          });
          if (response.ok) {
            const result = await response.json();
            set("voiceNoteUrl", result.url);
          } else {
            alert("Failed to upload voice note. Please try again.");
          }
        } catch (err) {
          console.error("Voice upload error:", err);
        } finally {
          setUploadingVoice(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setRecording(false);
    }
  }

  function deleteVoiceNote() {
    setAudioUrl(null);
    set("voiceNoteUrl", "");
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
    <div className="card p-4 sm:p-6 space-y-4 pb-24 md:pb-6 bg-white border border-line" style={{ borderRadius: "20px" }}>
      <Field label={t("title")} error={errors.title}>
        <input className={`input text-[14px] ${errors.title ? "input-error" : ""}`} value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label={t("description")} error={errors.description}>
        <textarea className={`input min-h-[110px] text-[14px] ${errors.description ? "input-error" : ""}`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={t("description_placeholder")} />
      </Field>

      {/* Voice Note Recorder Widget */}
      <Field label={t("voice_note")}>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <button
            type="button"
            onClick={async () => {
              if (!form.description) return alert("Write a description first for AI Triage.");
              setAiTriaging(true);
              try {
                const res = await fetch("/api/ai/triage", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: form.description }),
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data.triage?.urgency) set("urgency", data.triage.urgency);
                }
              } catch {
                // Ignore
              } finally {
                setAiTriaging(false);
              }
            }}
            className="btn btn-secondary !py-2 !px-4 text-[13px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-900 flex items-center gap-1.5 active:scale-95 transition"
          >
            {aiTriaging ? "✨ Analyzing..." : "✨ AI Smart Triage"}
          </button>
          {!audioUrl && !recording && (
            <button
              type="button"
              onClick={startRecording}
              className="btn btn-ghost !py-2 !px-4 text-[13px] font-bold border border-line flex items-center gap-1.5 active:scale-95 transition"
            >
              {t("record_voice")}
            </button>
          )}
          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="btn bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 !py-2 !px-4 text-[13px] font-bold flex items-center gap-1.5 animate-pulse"
            >
              {t("stop_recording")}
            </button>
          )}
          {audioUrl && (
            <div className="flex flex-col gap-2 w-full max-w-sm rounded-xl border border-line p-3 bg-gray-50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                {uploadingVoice ? "⏳ Uploading voice note..." : "🔊 Playback voice details"}
              </span>
              <div className="flex items-center gap-2">
                <audio src={audioUrl} className="w-full h-8" controls />
                <button
                  type="button"
                  onClick={deleteVoiceNote}
                  className="btn btn-ghost !p-2 border border-line hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 transition"
                  title={t("delete_voice")}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Address">
          <input className="input text-[14px]" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="House number, Street name" />
        </Field>
        <Field label={t("landmark")} error={errors.landmark}>
          <input className="input text-[14px]" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} placeholder={t("landmark_placeholder")} />
        </Field>
      </div>

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
        <Field label={t("urgency")}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "FLEXIBLE", label: t("flexible") },
              { value: "WITHIN_WEEK", label: t("within_week") },
              { value: "WITHIN_48_HOURS", label: t("within_48_hours") },
              { value: "EMERGENCY", label: t("emergency") }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`py-2 px-3 text-[13px] font-bold rounded-xl border text-center transition active:scale-[0.97] min-h-[44px] flex items-center justify-center ${
                  form.urgency === opt.value
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-[#f8fafc] text-slate border-line hover:bg-mist"
                }`}
                onClick={() => set("urgency", opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label={t("preferred_contact")}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "ANY", label: t("any") },
              { value: "PHONE", label: t("phone") },
              { value: "WHATSAPP", label: t("whatsapp") },
              { value: "EMAIL", label: t("email") }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`py-2 px-3 text-[13px] font-bold rounded-xl border text-center transition active:scale-[0.97] min-h-[44px] flex items-center justify-center ${
                  form.contactPreference === opt.value
                    ? "bg-brand text-white border-brand shadow-sm"
                    : "bg-[#f8fafc] text-slate border-line hover:bg-mist"
                }`}
                onClick={() => set("contactPreference", opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("budget_min")}>
          <input type="number" inputMode="numeric" className="input text-[14px]" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} />
        </Field>
        <Field label={t("budget_max")}>
          <input type="number" inputMode="numeric" className="input text-[14px]" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} />
        </Field>
      </div>

      {errors.form && <p className="text-[13px]" style={{ color: "#a32d2d" }}>{errors.form}</p>}
      
      <div className="sticky-bottom-bar md:static md:p-0 md:bg-transparent md:shadow-none md:border-t-0 md:mt-4">
        <button className="btn btn-primary w-full shadow-md md:shadow-none" disabled={submitting} onClick={submit}>
          {submitting ? t("submitting") : t("submit_request")}
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
