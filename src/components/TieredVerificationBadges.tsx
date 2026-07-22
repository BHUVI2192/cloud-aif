"use client";
import { useState } from "react";

interface DocumentVerificationInfo {
  type: "ID_PROOF" | "ADDRESS_PROOF" | "CERTIFICATION" | "OTHER";
  status: "APPROVED" | "PENDING" | "REJECTED";
  verifiedAt?: string | Date | null;
  notes?: string | null;
}

interface TieredVerificationBadgesProps {
  documents?: DocumentVerificationInfo[];
  verifiedBadge?: boolean;
}

export default function TieredVerificationBadges({ documents = [], verifiedBadge }: TieredVerificationBadgesProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentVerificationInfo | null>(null);

  const idDoc = documents.find((d) => d.type === "ID_PROOF" && d.status === "APPROVED");
  const addressDoc = documents.find((d) => d.type === "ADDRESS_PROOF" && d.status === "APPROVED");
  const policeDoc = documents.find((d) => d.type === "CERTIFICATION" && d.status === "APPROVED");

  const badges = [
    {
      id: "ID_PROOF",
      label: "ID Verified",
      icon: "🪪",
      isVerified: !!idDoc || !!verifiedBadge,
      title: "Government Identity Verification",
      description: "Aadhaar Card or PAN Card verified against government records by Ogenzo Admin.",
      docInfo: idDoc,
    },
    {
      id: "ADDRESS_PROOF",
      label: "Address Verified",
      icon: "🏠",
      isVerified: !!addressDoc || !!verifiedBadge,
      title: "Local Address Verification",
      description: "Shivamogga local address proof (utility bill or rental agreement) physically validated.",
      docInfo: addressDoc,
    },
    {
      id: "CERTIFICATION",
      label: "Background Checked",
      icon: "🛡️",
      isVerified: !!policeDoc || !!verifiedBadge,
      title: "Police & Background Screening",
      description: "Police clearance certificate and clean criminal record submission approved.",
      docInfo: policeDoc,
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedDoc(b as any)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition border ${
              b.isVerified
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
            {b.isVerified ? <span className="text-emerald-600 font-black">✓</span> : <span className="text-slate-400">?</span>}
          </button>
        ))}
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{(selectedDoc as any).icon}</span>
                <h4 className="font-display text-sm font-bold text-slate-900">{(selectedDoc as any).title}</h4>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">{(selectedDoc as any).description}</p>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] space-y-1 border text-slate-700">
              <p>Status: <strong className="text-emerald-700">Verified & Approved ✓</strong></p>
              <p>Verified By: <strong>Ogenzo Trust & Compliance Team</strong></p>
              {(selectedDoc as any).docInfo?.verifiedAt && (
                <p>Verified Date: {new Date((selectedDoc as any).docInfo.verifiedAt).toLocaleDateString()}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={() => setSelectedDoc(null)} className="btn btn-ghost text-xs !py-1.5 !px-3">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
