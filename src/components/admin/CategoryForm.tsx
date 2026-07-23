"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  category?: Category;
}

export default function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [iconKey, setIconKey] = useState(category?.iconKey || "tool");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder || 0);
  const [isActive, setIsActive] = useState(category?.isActive !== false);

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
    if (!category) {
      setSlug(autoGenerateSlug(val));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return;
    setLoading(true);
    setError("");

    try {
      const isEdit = !!category;
      const url = "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit 
        ? { id: category.id, name, slug, description, iconKey, sortOrder, isActive }
        : { name, slug, description, iconKey, sortOrder, isActive };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} category`);

      router.push("/admin/categories");
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
        {category ? `Edit Category: ${category.name}` : "Create New Category"}
      </h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">Category Name</label>
          <input
            type="text"
            className="input w-full text-[13px]"
            placeholder="e.g. Electrical Works"
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
            placeholder="e.g. electrical-works"
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
          placeholder="Provide details about what services this category includes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="label text-[12px] font-bold text-slate">Icon Key</label>
          <input
            type="text"
            className="input w-full text-[13px] font-mono"
            placeholder="e.g. wrench, lightbulb"
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value)}
          />
        </div>
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
          onClick={() => router.push("/admin/categories")}
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
          {category ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
