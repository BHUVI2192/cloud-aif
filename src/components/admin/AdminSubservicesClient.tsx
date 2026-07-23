"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Subservice {
  id: string;
  categoryId: string;
  category: Category;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  initialSubservices: Subservice[];
  categories: Category[];
}

export default function AdminSubservicesClient({ initialSubservices, categories }: Props) {
  const router = useRouter();
  const [subservices, setSubservices] = useState<Subservice[]>(initialSubservices);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this subservice? This will soft-delete it and hide it from all public forms.")) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/subservices?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete subservice");

      router.refresh();
      setSubservices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredSubservices = subservices.filter(
    (s) => !selectedFilterCategory || s.categoryId === selectedFilterCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[18px] font-bold text-forest">Subservices Overview</h2>
          <select
            className="input text-[13px] py-1 px-3 w-48 bg-white border border-outline-variant"
            value={selectedFilterCategory}
            onChange={(e) => setSelectedFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Link
          href="/admin/subservices/new"
          className="btn btn-primary text-[13px] py-2 flex items-center gap-1.5 font-bold"
        >
          <Plus className="h-4 w-4" />
          Add Subservice
        </Link>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="card !p-0 overflow-hidden border border-outline-variant">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr style={{ color: "var(--slate)", background: "var(--mist)" }}>
                <th className="px-4 py-3 text-left">Subservice</th>
                <th className="text-left">Category</th>
                <th className="text-left">Slug</th>
                <th className="text-left">Sort</th>
                <th className="text-left">Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubservices.map((s) => (
                <tr key={s.id} className="border-t hover:bg-surface-container-lowest transition-colors" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-forest">{s.name}</span>
                  </td>
                  <td>
                    <span className="text-slate font-semibold text-[13px]">{s.category.name}</span>
                  </td>
                  <td>
                    <span className="text-slate font-mono text-[12px]">{s.slug}</span>
                  </td>
                  <td className="text-slate">{s.sortOrder}</td>
                  <td>
                    <span className={`badge ${s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} border px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                      {s.isActive ? "active" : "hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/subservices/${s.id}/edit`}
                        className="p-1.5 text-slate hover:text-primary hover:bg-surface-container rounded-lg transition inline-block"
                        title="Edit Subservice"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={loading}
                        className="p-1.5 text-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Subservice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
