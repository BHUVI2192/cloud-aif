"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import MapPicker from "./MapPicker";

type Area = { id: string; name: string };


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
    preferredTime: "",
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

  // Load default address & phone on initialization
  useEffect(() => {
    fetch("/api/customer/default-address")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.phone) setForm((f) => ({ ...f, phone: data.phone }));
          if (data.address) {
            setForm((f) => ({
              ...f,
              addressLine: data.address.line1 || "",
              landmark: data.address.line2 || "",
              latitude: data.address.latitude || 13.9299,
              longitude: data.address.longitude || 75.5681,
            }));
          }
        }
      })
      .catch((err) => console.warn("Failed to load default address:", err));
  }, []);

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
      let options: any = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        options = { mimeType: "audio/ogg" };
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        options = { mimeType: "audio/wav" };
      }
      
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        let ext = ".webm";
        if (recorder.mimeType.includes("mp4")) ext = ".mp4";
        else if (recorder.mimeType.includes("ogg")) ext = ".ogg";
        else if (recorder.mimeType.includes("wav")) ext = ".wav";

        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const localUrl = URL.createObjectURL(blob);
        setAudioUrl(localUrl);

        // Immediately upload to server using uploadFile storage helper
        setUploadingVoice(true);
        try {
          const data = new FormData();
          data.append("file", blob, `voice-note${ext}`);
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
    if (!form.preferredDate) e.preferredDate = "Choose a preferred date.";
    if (!form.preferredTime) e.preferredTime = "Choose a preferred time slot.";
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
        <Field label="Preferred date" error={errors.preferredDate}>
          <input type="date" className="input text-[14px]" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} />
        </Field>
      </div>

      {form.preferredDate && (
        <Field label="Preferred time slot" error={errors.preferredTime}>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "09:00 - 11:00",
              "11:00 - 13:00",
              "13:00 - 15:00",
              "15:00 - 17:00"
            ].map((slot) => {
              const isSelected = form.preferredTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => set("preferredTime", slot)}
                  className={`px-3 py-1.5 text-[12.5px] font-semibold rounded-full border transition-all duration-150 ${
                    isSelected
                      ? "bg-mist border-brand text-brand"
                      : "bg-white border-line text-slate hover:border-slate/30"
                  }`}
                  style={{ minHeight: "36px" }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </Field>
      )}

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
