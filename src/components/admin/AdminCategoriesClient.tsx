"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconKey, setIconKey] = useState("tool");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Edit states
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIconKey, setEditIconKey] = useState("tool");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const autoGenerateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric, non-space, non-hyphens
      .replace(/[\s_]+/g, "-")  // replace spaces/underscores with hyphens
      .replace(/-+/g, "-");     // remove duplicate hyphens
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(autoGenerateSlug(val));
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
    setEditSlug(autoGenerateSlug(val));
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !slug) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description, iconKey, sortOrder, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      setName("");
      setSlug("");
      setDescription("");
      setIconKey("tool");
      setSortOrder(0);
      setIsActive(true);
      setShowAddForm(false);

      router.refresh();
      setCategories((prev) => [...prev, { ...data.category, _count: { subservices: 0, serviceRequests: 0 } }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editName || !editSlug) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName,
          slug: editSlug,
          description: editDescription,
          iconKey: editIconKey,
          sortOrder: editSortOrder,
          isActive: editIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");

      setEditingId(null);
      router.refresh();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...data.category } : c
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditDescription(c.description || "");
    setEditIconKey(c.iconKey || "tool");
    setEditSortOrder(c.sortOrder);
    setEditIsActive(c.isActive);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-forest">Manage Categories</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary text-[13px] py-2 flex items-center gap-1.5"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] font-semibold">
          ⚠️ {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="card space-y-4 border border-primary/20 bg-surface">
          <h3 className="font-bold text-[15px] text-forest">New Service Category</h3>
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
              className="input w-full text-[13px] min-h-[70px]"
              placeholder="Provide a brief explanation of this category..."
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
            <div className="space-y-1 flex flex-col justify-end pb-2">
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-[13px] py-2 px-6"
            >
              Create Category
            </button>
          </div>
        </form>
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
              {categories.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="border-t hover:bg-surface-container-lowest transition-colors" style={{ borderColor: "var(--line)" }}>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input text-[13px] py-1 px-2 w-full max-w-[160px]"
                          value={editName}
                          onChange={(e) => handleEditNameChange(e.target.value)}
                        />
                      ) : (
                        <span className="font-semibold text-forest">{c.name}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input text-[13px] font-mono py-1 px-2 w-full max-w-[160px]"
                          value={editSlug}
                          onChange={(e) => setEditSlug(autoGenerateSlug(e.target.value))}
                        />
                      ) : (
                        <span className="text-slate font-mono text-[12px]">{c.slug}</span>
                      )}
                    </td>
                    <td className="text-slate">{c._count.subservices}</td>
                    <td className="text-slate">{c._count.serviceRequests}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="input text-[13px] py-1 px-2 w-16"
                          value={editSortOrder}
                          onChange={(e) => setEditSortOrder(Number(e.target.value))}
                        />
                      ) : (
                        <span className="text-slate">{c.sortOrder}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <label className="flex items-center gap-1.5 cursor-pointer text-[13px]">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                            className="rounded h-4 w-4"
                          />
                          Active
                        </label>
                      ) : (
                        <span className={`badge ${c.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} border px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                          {c.isActive ? "active" : "hidden"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdate(c.id)}
                            disabled={loading}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Save Changes"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate hover:bg-surface-container rounded-lg transition"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => startEdit(c)}
                            className="p-1.5 text-slate hover:text-primary hover:bg-surface-container rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
