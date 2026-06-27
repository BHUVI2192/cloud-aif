"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Setting {
  id: string;
  key: string;
  value: string;
  valueType: string;
  group: string | null;
  label: string | null;
  isPublic: boolean;
}

export default function AdminSettingsForm({ initialSettings }: { initialSettings: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    initialSettings.forEach((s) => {
      vals[s.key] = s.value;
    });
    return vals;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setMessage({ text: "Settings saved successfully!", error: false });
        router.refresh();
      } else {
        setMessage({ text: "Failed to save settings.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred. Please try again.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-[640px] space-y-5">
      {initialSettings.map((s) => (
        <div key={s.id}>
          <label className="label">{s.label ?? s.key.replace(/_/g, " ").toUpperCase()}</label>
          <input
            className="input"
            value={values[s.key] ?? ""}
            onChange={(e) => handleChange(s.key, e.target.value)}
            disabled={loading}
          />
          <p className="mt-1 text-[12px]" style={{ color: "var(--slate)" }}>
            Group: <span className="capitalize">{s.group}</span> · Type: {s.valueType}
            {s.isPublic ? " · public settings" : " · private settings"}
          </p>
        </div>
      ))}

      {message && (
        <p
          className="text-[14px] font-semibold"
          style={{ color: message.error ? "#a32d2d" : "var(--emerald)" }}
        >
          {message.text}
        </p>
      )}

      <button className="btn btn-primary" disabled={loading} onClick={handleSave}>
        {loading ? "Saving settings…" : "Save settings"}
      </button>
    </div>
  );
}
