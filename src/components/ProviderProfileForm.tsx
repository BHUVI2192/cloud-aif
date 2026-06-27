"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProviderProfile {
  id: string;
  legalName: string;
  displayName: string;
  businessName: string | null;
  headline: string | null;
  bio: string | null;
  experienceYears: number;
  languages: string[];
  serviceRadiusKm: number | null;
  completenessScore: number;
  primaryCategoryId: string | null;
  profileImage: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function ProviderProfileForm({
  profile,
  categories = [],
  initialPhone = "",
}: {
  profile: ProviderProfile;
  categories?: Category[];
  initialPhone?: string;
}) {
  const router = useRouter();
  const [legalName, setLegalName] = useState(profile.legalName);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [businessName, setBusinessName] = useState(profile.businessName ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(profile.experienceYears);
  const [languages, setLanguages] = useState(profile.languages.join(", "));
  const [serviceRadiusKm, setServiceRadiusKm] = useState(profile.serviceRadiusKm ?? "");
  const [primaryCategoryId, setPrimaryCategoryId] = useState(profile.primaryCategoryId ?? "");
  const [phone, setPhone] = useState(initialPhone);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!/^\d{10}$/.test(phone.trim())) {
      setMessage({ text: "Provide a valid 10-digit mobile number.", error: true });
      setLoading(false);
      return;
    }

    if (!primaryCategoryId) {
      setMessage({ text: "Please select a primary category.", error: true });
      setLoading(false);
      return;
    }

    // Format languages from comma-separated string to string array
    const langArray = languages
      .split(",")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      const res = await fetch("/api/provider/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          displayName,
          businessName: businessName || null,
          headline: headline || null,
          bio: bio || null,
          experienceYears: Number(experienceYears),
          languages: langArray,
          serviceRadiusKm: serviceRadiusKm ? Number(serviceRadiusKm) : null,
          primaryCategoryId,
          phone,
        }),
      });

      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", error: false });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to update profile.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred. Please try again.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="card max-w-[640px] space-y-4">
      {profile.profileImage && (
        <div className="flex items-center gap-5 border-b pb-4 mb-4" style={{ borderColor: "var(--line)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.profileImage}
            alt="Profile Photo"
            className="w-20 h-20 rounded-full object-cover border-2"
            style={{ borderColor: "var(--brand)" }}
          />
          <div>
            <h3 className="text-[16px] font-semibold" style={{ color: "var(--forest)" }}>Your Profile Picture</h3>
            <p className="text-[12px]" style={{ color: "var(--slate)" }}>This photo was submitted with your verification application and is displayed on your public profile.</p>
          </div>
        </div>
      )}

      <div>
        <label className="label">Legal Name (As on ID card)</label>
        <input
          required
          className="input"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="label">Public Display Name</label>
        <input
          required
          className="input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="label">Business Name (Optional)</label>
        <input
          className="input"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Primary Category</label>
          <select
            required
            className="input"
            value={primaryCategoryId}
            onChange={(e) => setPrimaryCategoryId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="label">Contact Mobile Number</label>
          <input
            required
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            placeholder="10-digit phone"
          />
        </div>
      </div>

      <div>
        <label className="label">Short Tagline / Headline</label>
        <input
          className="input"
          placeholder="e.g. Professional Electrician with 10+ years experience"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <label className="label">Bio</label>
        <textarea
          className="input min-h-[100px]"
          placeholder="Tell customers about your services, values, and experience..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Experience (Years)</label>
          <input
            type="number"
            min="0"
            className="input"
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            disabled={loading}
          />
        </div>
        <div>
          <label className="label">Service Radius (Km)</label>
          <input
            type="number"
            min="1"
            className="input"
            value={serviceRadiusKm}
            onChange={(e) => setServiceRadiusKm(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="label">Languages (Comma-separated)</label>
        <input
          className="input"
          placeholder="e.g. Kannada, English, Hindi"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="text-[14px]">
        Profile Completeness: <span className="font-semibold" style={{ color: "var(--emerald)" }}>{profile.completenessScore}%</span>
      </div>

      {message && (
        <p
          className="text-[14px] font-semibold"
          style={{ color: message.error ? "#a32d2d" : "var(--emerald)" }}
        >
          {message.text}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save Profile Details"}
      </button>
    </form>
  );
}
