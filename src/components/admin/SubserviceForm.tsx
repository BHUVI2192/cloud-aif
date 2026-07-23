"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Subservice {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  subservice?: Subservice;
  categories: Category[];
}

export default function SubserviceForm({ subservice, categories }: Props) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(subservice?.categoryId || categories[0]?.id || "");
  const [name, setName] = useState(subservice?.name || "");
  const [slug, setSlug] = useState(subservice?.slug || "");
  const [description, setDescription] = useState(subservice?.description || "");
  const [sortOrder, setSortOrder] = useState(subservice?.sortOrder || 0);
  const [isActive, setIsActive] = useState(subservice?.isActive !== false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const autoGenerateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!subservice) {
      setSlug(autoGenerateSlug(val));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !name || !slug) return;
    setLoading(true);
    setError("");

    try {
      const isEdit = !!subservice;
      const url = "/api/admin/subservices";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit 
        ? { id: subservice.id, categoryId, name, slug, description, sortOrder, isActive }
        : { categoryId, name, slug, description, sortOrder, isActive };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} subservice`);

      router.push("/admin/subservices");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-[640px] mx-auto border border-outline-variant bg-white shadow-sm">
      <h3 className="font-bold text-[16px] text-forest">
        {subservice ? `Edit Subservice: ${subservice.name}` : "Create New Subservice"}
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">Parent Category</label>
          <select
            className="input w-full text-[13px]"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">Subservice Name</label>
          <input
            type="text"
            className="input w-full text-[13px]"
            placeholder="e.g. AC Installation"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">URL Slug</label>
          <input
            type="text"
            className="input w-full text-[13px] font-mono"
            placeholder="e.g. ac-installation"
            value={slug}
            onChange={(e) => setSlug(autoGenerateSlug(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="label text-[12px] font-bold text-slate">Description (Optional)</label>
        <textarea
          className="input w-full text-[13px] min-h-[90px]"
          placeholder="Provide details about what this subservice covers..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">Sort Order</label>
          <input
            type="number"
            className="input w-full text-[13px]"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1 flex flex-col justify-end pb-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[13px] font-semibold text-forest">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-outline text-primary focus:ring-primary h-4 w-4"
            />
            Is Active & Visible
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-outline-variant gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/subservices")}
          className="btn btn-ghost text-[13px] py-2 px-5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary text-[13px] py-2 px-6 flex items-center gap-1.5 font-bold"
        >
          <Save className="h-4 w-4" />
          {subservice ? "Save Changes" : "Create Subservice"}
        </button>
      </div>
    </form>
  );
}
