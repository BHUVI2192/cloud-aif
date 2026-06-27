"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingUnit } from "@prisma/client";

interface Subservice {
  id: string;
  name: string;
  category: {
    name: string;
  };
}

interface ServiceArea {
  id: string;
  name: string;
}

interface PricingItem {
  id?: string;
  label: string;
  unit: PricingUnit;
  amountMin: number;
  amountMax: number | null;
  subserviceId: string | null;
}

interface ProviderServicesFormProps {
  allSubservices: Subservice[];
  allServiceAreas: ServiceArea[];
  initialSubserviceIds: string[];
  initialServiceAreaIds: string[];
  initialPricing: PricingItem[];
}

const UNITS: PricingUnit[] = ["FLAT", "PER_HOUR", "PER_VISIT", "PER_SQFT", "PER_ROOM", "PER_SESSION", "CUSTOM"];

export default function ProviderServicesForm({
  allSubservices,
  allServiceAreas,
  initialSubserviceIds,
  initialServiceAreaIds,
  initialPricing,
}: ProviderServicesFormProps) {
  const router = useRouter();
  const [selectedSubservices, setSelectedSubservices] = useState<string[]>(initialSubserviceIds);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialServiceAreaIds);
  const [pricing, setPricing] = useState<PricingItem[]>(initialPricing);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Group subservices by category for beautiful layout
  const groupedSubservices = allSubservices.reduce((acc, sub) => {
    const catName = sub.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(sub);
    return acc;
  }, {} as Record<string, Subservice[]>);

  function handleSubserviceToggle(id: string) {
    setSelectedSubservices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAreaToggle(id: string) {
    setSelectedAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addPriceRow() {
    setPricing((prev) => [
      ...prev,
      { label: "", unit: "FLAT" as PricingUnit, amountMin: 0, amountMax: null, subserviceId: null },
    ]);
  }

  function deletePriceRow(idx: number) {
    setPricing((prev) => prev.filter((_, i) => i !== idx));
  }

  function updatePriceRow<K extends keyof PricingItem>(idx: number, key: K, val: PricingItem[K]) {
    setPricing((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: val } : row))
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Save services and areas
      const resServices = await fetch("/api/provider/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subserviceIds: selectedSubservices,
          serviceAreaIds: selectedAreas,
        }),
      });

      if (!resServices.ok) {
        throw new Error("Failed to save services & areas");
      }

      // 2. Save pricing (convert amount values to numbers)
      const formattedPricing = pricing.map((p) => ({
        label: p.label,
        unit: p.unit,
        amountMin: Number(p.amountMin),
        amountMax: p.amountMax ? Number(p.amountMax) : null,
        subserviceId: p.subserviceId,
      }));

      const resPricing = await fetch("/api/provider/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing: formattedPricing }),
      });

      if (!resPricing.ok) {
        throw new Error("Failed to save pricing catalog");
      }

      setMessage({ text: "Services, areas, and pricing updated successfully!", error: false });
      router.refresh();
    } catch (err: any) {
      setMessage({ text: err.message || "An error occurred.", error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subservices Select */}
        <div className="card">
          <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
            Select Services Offered
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(groupedSubservices).map(([catName, subs]) => (
              <div key={catName}>
                <h3 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--slate)" }}>
                  {catName}
                </h3>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {subs.map((s) => {
                    const isChecked = selectedSubservices.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-[14px] cursor-pointer transition ${
                          isChecked ? "bg-mist border-emerald" : "border-line hover:bg-mist"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-emerald"
                          checked={isChecked}
                          onChange={() => handleSubserviceToggle(s.id)}
                          disabled={loading}
                        />
                        <span style={{ color: "var(--forest)" }}>{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Areas Select */}
        <div className="card">
          <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
            Select Service Areas Covered (Shivamogga Localities)
          </h2>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-[400px] overflow-y-auto pr-2">
            {allServiceAreas.map((a) => {
              const isChecked = selectedAreas.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-[13px] cursor-pointer transition ${
                    isChecked ? "bg-mist border-emerald" : "border-line hover:bg-mist"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-emerald"
                    checked={isChecked}
                    onChange={() => handleAreaToggle(a.id)}
                    disabled={loading}
                  />
                  <span style={{ color: "var(--forest)" }}>{a.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Catalog */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
            Pricing Catalog
          </h2>
          <button
            type="button"
            className="btn btn-ghost !py-1.5 !px-3 !text-[13px]"
            onClick={addPriceRow}
            disabled={loading}
          >
            + Add Price Row
          </button>
        </div>

        {pricing.length === 0 ? (
          <p className="text-[14px]" style={{ color: "var(--slate)" }}>
            No pricing records set up. Add rows to define flat or hourly rates.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ color: "var(--slate)" }}>
                  <th className="py-2 text-left">Label (e.g. Bathroom deep clean)</th>
                  <th className="text-left w-32">Unit</th>
                  <th className="text-left w-28">Min (₹)</th>
                  <th className="text-left w-28">Max (₹, Optional)</th>
                  <th className="text-left w-48">Service Link</th>
                  <th className="text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, idx) => (
                  <tr key={idx} className="border-t" style={{ borderColor: "var(--line)" }}>
                    <td className="py-2 pr-2">
                      <input
                        required
                        className="input !py-1.5"
                        placeholder="Label"
                        value={row.label}
                        onChange={(e) => updatePriceRow(idx, "label", e.target.value)}
                        disabled={loading}
                      />
                    </td>
                    <td className="pr-2">
                      <select
                        className="input !py-1.5 capitalize"
                        value={row.unit}
                        onChange={(e) => updatePriceRow(idx, "unit", e.target.value as PricingUnit)}
                        disabled={loading}
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u} className="capitalize">
                            {u.toLowerCase().replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="pr-2">
                      <input
                        required
                        type="number"
                        min="0"
                        className="input !py-1.5"
                        value={row.amountMin}
                        onChange={(e) => updatePriceRow(idx, "amountMin", Number(e.target.value))}
                        disabled={loading}
                      />
                    </td>
                    <td className="pr-2">
                      <input
                        type="number"
                        min="0"
                        className="input !py-1.5"
                        value={row.amountMax ?? ""}
                        onChange={(e) =>
                          updatePriceRow(idx, "amountMax", e.target.value ? Number(e.target.value) : null)
                        }
                        placeholder="—"
                        disabled={loading}
                      />
                    </td>
                    <td className="pr-2">
                      <select
                        className="input !py-1.5"
                        value={row.subserviceId ?? ""}
                        onChange={(e) =>
                          updatePriceRow(idx, "subserviceId", e.target.value ? e.target.value : null)
                        }
                        disabled={loading}
                      >
                        <option value="">No link (General Category)</option>
                        {allSubservices
                          .filter((sub) => selectedSubservices.includes(sub.id))
                          .map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost !py-1 !px-2.5"
                        style={{ color: "#a32d2d" }}
                        onClick={() => deletePriceRow(idx)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        {loading ? "Saving Changes…" : "Save Services & Pricing"}
      </button>
    </form>
  );
}
