"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Category = { id: string; name: string };

export default function OnboardingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [form, setForm] = useState({
    legalName: "",
    displayName: "",
    primaryCategoryId: "",
    experienceYears: "0",
    phone: "",
  });

  const [files, setFiles] = useState<{
    profilePic: File | null;
    idProof: File | null;
    addressProof: File | null;
  }>({
    profilePic: null,
    idProof: null,
    addressProof: null,
  });

  const [previews, setPreviews] = useState<{
    profilePic: string | null;
    idProofName: string | null;
    addressProofName: string | null;
  }>({
    profilePic: null,
    idProofName: null,
    addressProofName: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleInputChange(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleFileChange(k: keyof typeof files, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setFiles((f) => ({ ...f, [k]: file }));

    if (file) {
      if (k === "profilePic") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((p) => ({ ...p, profilePic: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((p) => ({ ...p, [`${k}Name`]: file.name }));
      }
    } else {
      if (k === "profilePic") {
        setPreviews((p) => ({ ...p, profilePic: null }));
      } else {
        setPreviews((p) => ({ ...p, [`${k}Name`]: null }));
      }
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.legalName.trim()) e.legalName = "Legal Name is required.";
    if (!form.displayName.trim()) e.displayName = "Display / Business Name is required.";
    if (!form.primaryCategoryId) e.primaryCategoryId = "Please select a category.";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      e.phone = "Provide a valid 10-digit primary phone number.";
    }
    if (!files.profilePic) e.profilePic = "Please upload a profile picture.";
    if (!files.idProof) e.idProof = "Please upload ID proof document.";
    if (!files.addressProof) e.addressProof = "Please upload Address proof document.";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const data = new FormData();
      data.append("legalName", form.legalName);
      data.append("displayName", form.displayName);
      data.append("primaryCategoryId", form.primaryCategoryId);
      data.append("experienceYears", form.experienceYears);
      data.append("phone", form.phone);
      
      if (files.profilePic) data.append("profilePic", files.profilePic);
      if (files.idProof) data.append("idProof", files.idProof);
      if (files.addressProof) data.append("addressProof", files.addressProof);

      const res = await fetch("/api/provider/onboarding", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        await updateSession();
        setTimeout(() => {
          router.push("/provider");
        }, 600);
      } else {
        const errData = await res.json();
        setErrors({ form: errData.error || "Failed to submit onboarding profile." });
      }
    } catch (err) {
      setErrors({ form: "An unexpected error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card space-y-6" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
      <div className="border-b pb-4" style={{ borderColor: "var(--line)" }}>
        <h2 className="text-[22px] font-semibold" style={{ color: "var(--forest)" }}>Provider Verification Form</h2>
        <p className="text-[14px] mt-1" style={{ color: "var(--slate)" }}>
          Please complete your onboarding details. All documents are encrypted and reviewed by administrators.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Legal Name (matching ID)" error={errors.legalName}>
          <input 
            className="input" 
            value={form.legalName} 
            onChange={(e) => handleInputChange("legalName", e.target.value)} 
            placeholder="e.g. Suresh Kumar"
          />
        </Field>

        <Field label="Display / Business Name" error={errors.displayName}>
          <input 
            className="input" 
            value={form.displayName} 
            onChange={(e) => handleInputChange("displayName", e.target.value)} 
            placeholder="e.g. Suresh Electricals"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Primary Category" error={errors.primaryCategoryId}>
          <select 
            className="input" 
            value={form.primaryCategoryId} 
            onChange={(e) => handleInputChange("primaryCategoryId", e.target.value)}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Years of Experience" error={errors.experienceYears}>
          <input 
            type="number" 
            min="0" 
            className="input" 
            value={form.experienceYears} 
            onChange={(e) => handleInputChange("experienceYears", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Contact Mobile Number" error={errors.phone}>
        <input 
          type="tel" 
          className="input" 
          value={form.phone} 
          onChange={(e) => handleInputChange("phone", e.target.value)} 
          placeholder="10-digit mobile number"
        />
      </Field>

      {/* Profile Picture Upload Section (Uber-style DP) */}
      <div className="border-t pt-5" style={{ borderColor: "var(--line)" }}>
        <h3 className="text-[16px] font-semibold mb-3" style={{ color: "var(--forest)" }}>Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div 
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50"
            style={{ borderColor: errors.profilePic ? "#a32d2d" : "var(--line)" }}
          >
            {previews.profilePic ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previews.profilePic} alt="DP Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[28px]" style={{ color: "var(--slate)" }}>👤</span>
            )}
          </div>
          <div>
            <label className="btn btn-ghost text-[13px] py-1.5 px-4 cursor-pointer" style={{ border: "1px solid var(--line)" }}>
              Upload Profile Photo
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange("profilePic", e)} 
              />
            </label>
            <p className="text-[12px] mt-1.5" style={{ color: "var(--slate)" }}>
              Clear headshot (JPEG/PNG) to display on your public profile.
            </p>
            {errors.profilePic && <p className="text-[12px] mt-1" style={{ color: "#a32d2d" }}>{errors.profilePic}</p>}
          </div>
        </div>
      </div>

      {/* Document Uploads Section */}
      <div className="border-t pt-5 space-y-5" style={{ borderColor: "var(--line)" }}>
        <h3 className="text-[16px] font-semibold" style={{ color: "var(--forest)" }}>Verification Documents</h3>

        {/* ID Proof */}
        <div className="space-y-2">
          <label className="label block font-semibold text-[13px]">Identity Proof (Aadhaar Card, PAN Card, or DL)</label>
          <div 
            className="flex items-center justify-between border rounded-xl p-3 bg-gray-50"
            style={{ borderColor: errors.idProof ? "#a32d2d" : "var(--line)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🪪</span>
              <span className="text-[13px] truncate max-w-[200px]" style={{ color: previews.idProofName ? "var(--forest)" : "var(--slate)" }}>
                {previews.idProofName || "No file selected"}
              </span>
            </div>
            <label className="btn btn-ghost text-[12px] py-1 px-3 cursor-pointer" style={{ border: "1px solid var(--line)", minHeight: "auto" }}>
              Choose File
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange("idProof", e)} 
              />
            </label>
          </div>
          {errors.idProof && <p className="text-[12px]" style={{ color: "#a32d2d" }}>{errors.idProof}</p>}
        </div>

        {/* Address Proof */}
        <div className="space-y-2">
          <label className="label block font-semibold text-[13px]">Address Proof (Utility Bill, Rental Agreement, or Voter ID)</label>
          <div 
            className="flex items-center justify-between border rounded-xl p-3 bg-gray-50"
            style={{ borderColor: errors.addressProof ? "#a32d2d" : "var(--line)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-[20px]">🏠</span>
              <span className="text-[13px] truncate max-w-[200px]" style={{ color: previews.addressProofName ? "var(--forest)" : "var(--slate)" }}>
                {previews.addressProofName || "No file selected"}
              </span>
            </div>
            <label className="btn btn-ghost text-[12px] py-1 px-3 cursor-pointer" style={{ border: "1px solid var(--line)", minHeight: "auto" }}>
              Choose File
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange("addressProof", e)} 
              />
            </label>
          </div>
          {errors.addressProof && <p className="text-[12px]" style={{ color: "#a32d2d" }}>{errors.addressProof}</p>}
        </div>
      </div>

      {errors.form && <p className="text-[13px]" style={{ color: "#a32d2d" }}>{errors.form}</p>}

      <button 
        className="btn btn-primary w-full py-3" 
        disabled={submitting} 
        onClick={handleSubmit}
      >
        {submitting ? "Submitting Application..." : "Submit Verification Profile"}
      </button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <label className="label mb-1.5 block">{label}</label>
      {children}
      {error && <p className="mt-1 text-[12px]" style={{ color: "#a32d2d" }}>{error}</p>}
    </div>
  );
}
