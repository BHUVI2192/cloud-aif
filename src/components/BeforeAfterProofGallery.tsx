"use client";
import { useState, useEffect } from "react";

interface BeforeAfterProofGalleryProps {
  requestId: string;
  isProvider?: boolean;
}

export default function BeforeAfterProofGallery({ requestId, isProvider }: BeforeAfterProofGalleryProps) {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadType, setUploadType] = useState<"BEFORE" | "AFTER">("BEFORE");
  const [photoUrl, setPhotoUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProofs = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/proof`);
      const data = await res.json();
      if (res.ok && data.proofs) {
        setProofs(data.proofs);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, [requestId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: uploadType, photoUrl, caption }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPhotoUrl("");
        setCaption("");
        fetchProofs();
      } else {
        setErrorMsg(data.error || "Upload failed");
      }
    } catch {
      setErrorMsg("Network error submitting proof");
    } finally {
      setIsUploading(false);
    }
  };

  const beforePhotos = proofs.filter((p) => p.type === "BEFORE");
  const afterPhotos = proofs.filter((p) => p.type === "AFTER");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-base font-bold text-slate-900">📷 Service Photo Proofs</h4>
        <span className="text-xs font-semibold text-slate-500">{proofs.length} Photos Uploaded</span>
      </div>

      {isProvider && (
        <form onSubmit={handleUpload} className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Type:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUploadType("BEFORE")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  uploadType === "BEFORE" ? "bg-amber-600 text-white" : "bg-white text-slate-700 border"
                }`}
              >
                Before Work
              </button>
              <button
                type="button"
                onClick={() => setUploadType("AFTER")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  uploadType === "AFTER" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border"
                }`}
              >
                After Work
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate">Upload Photo File:</label>
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  setErrorMsg(null);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("bucket", "proof-photos");
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok && data.url) {
                      setPhotoUrl(data.url);
                    } else {
                      setErrorMsg(data.error || "Upload failed");
                    }
                  } catch {
                    setErrorMsg("Network error uploading file");
                  } finally {
                    setIsUploading(false);
                  }
                }}
                className="text-xs flex-1"
              />
            </div>
            
            {photoUrl && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                <span className="truncate flex-1">Selected photo: <strong>{photoUrl}</strong></span>
                <button type="button" onClick={() => setPhotoUrl("")} className="font-bold text-red-600 hover:text-red-700">Clear</button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isUploading || !photoUrl.trim()}
                className="btn btn-primary text-xs !py-2 !px-4 shrink-0"
              >
                {isUploading ? "Uploading..." : "Add Proof"}
              </button>
            </div>
          </div>
          {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}
        </form>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Before Photos ({beforePhotos.length})</h5>
          {beforePhotos.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No before photos added yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {beforePhotos.map((p) => (
                <div key={p.id} className="group relative aspect-video overflow-hidden rounded-lg border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photoUrl} alt="Before proof" className="h-full w-full object-cover" />
                  {p.caption && <span className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white truncate">{p.caption}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">After Photos ({afterPhotos.length})</h5>
          {afterPhotos.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No after photos added yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {afterPhotos.map((p) => (
                <div key={p.id} className="group relative aspect-video overflow-hidden rounded-lg border bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photoUrl} alt="After proof" className="h-full w-full object-cover" />
                  {p.caption && <span className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white truncate">{p.caption}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
