"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: {
    subservices: number;
    serviceRequests: number;
  };
}

interface Props {
  initialCategories: Category[];
}

export default function AdminCategoriesClient({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category? This will soft-delete it and hide it from all public forms.")) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      router.refresh();
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-forest">Categories Overview</h2>
        <Link
          href="/admin/categories/new"
          className="btn btn-primary text-[13px] py-2 flex items-center gap-1.5 font-bold"
        >
          <Plus className="h-4 w-4" />
          Add Category
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
                <th className="px-4 py-3 text-left">Name</th>
                <th className="text-left">Slug</th>
                <th className="text-left">Subservices</th>
                <th className="text-left">Requests</th>
                <th className="text-left">Sort</th>
                <th className="text-left">Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t hover:bg-surface-container-lowest transition-colors" style={{ borderColor: "var(--line)" }}>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-forest">{c.name}</span>
                  </td>
                  <td>
                    <span className="text-slate font-mono text-[12px]">{c.slug}</span>
                  </td>
                  <td className="text-slate">{c._count.subservices}</td>
                  <td className="text-slate">{c._count.serviceRequests}</td>
                  <td className="text-slate">{c.sortOrder}</td>
                  <td>
                    <span className={`badge ${c.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} border px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                      {c.isActive ? "active" : "hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/categories/${c.id}/edit`}
                        className="p-1.5 text-slate hover:text-primary hover:bg-surface-container rounded-lg transition inline-block"
                        title="Edit Category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={loading}
                        className="p-1.5 text-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Category"
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
