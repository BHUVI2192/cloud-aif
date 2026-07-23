"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "@/components/MapPicker";

interface CustomerProfileFormProps {
  initialData: {
    name: string;
    phone: string;
    line1: string;
    line2: string;
    locality: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
}

export default function CustomerProfileForm({ initialData }: CustomerProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [phone, setPhone] = useState(initialData.phone);
  const [line1, setLine1] = useState(initialData.line1);
  const [line2, setLine2] = useState(initialData.line2 || "");
  const [locality, setLocality] = useState(initialData.locality || "");
  const [pincode, setPincode] = useState(initialData.pincode || "");
  const [latitude, setLatitude] = useState(initialData.latitude);
  const [longitude, setLongitude] = useState(initialData.longitude);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/customer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          line1,
          line2: line2 || null,
          locality: locality || null,
          pincode: pincode || null,
          latitude: parseFloat(latitude.toString()),
          longitude: parseFloat(longitude.toString()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Profile and address updated successfully!");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to update profile settings.");
      }
    } catch {
      setErrorMsg("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-[20px] font-bold text-forest">Account details</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input text-[14px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              className="input text-[14px]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              minLength={10}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-[20px] font-bold text-forest">Default Address</h2>
        <p className="text-[13px] text-slate -mt-2">This address will be loaded by default when you book any service requests.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Flat / House Number / Building</label>
            <input
              type="text"
              className="input text-[14px]"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="e.g. Flat 104, Sunrise Apts"
              required
            />
          </div>

          <div>
            <label className="label">Street / Area / Landmark</label>
            <input
              type="text"
              className="input text-[14px]"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="e.g. 3rd Cross, near temple"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Locality (Ward/Sub-locality)</label>
            <input
              type="text"
              className="input text-[14px]"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Gandhi Bazar"
            />
          </div>

          <div>
            <label className="label">Pincode</label>
            <input
              type="text"
              className="input text-[14px]"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 577201"
            />
          </div>
        </div>

        {/* Embedded Map Pin Picker */}
        <div className="pt-2">
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-950 text-[13px] font-semibold border border-emerald-200">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-[13px] font-semibold border border-red-200">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary w-full !py-3 text-[14px] font-bold uppercase tracking-wider"
      >
        {saving ? "Saving Changes..." : "Save Profile Details"}
      </button>
    </form>
  );
}
