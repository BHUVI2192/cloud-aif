"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("");

  // Form states
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Edit states
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

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
    setSlug(autoGenerateSlug(val));
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
    setEditSlug(autoGenerateSlug(val));
  };

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !name || !slug) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/subservices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name, slug, description, sortOrder, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subservice");

      setName("");
      setSlug("");
      setDescription("");
      setSortOrder(0);
      setIsActive(true);
      setShowAddForm(false);

      router.refresh();
      const parentCat = categories.find((c) => c.id === categoryId) || { id: categoryId, name: "" };
      setSubservices((prev) => [...prev, { ...data.subservice, category: parentCat }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!editCategoryId || !editName || !editSlug) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/subservices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          categoryId: editCategoryId,
          name: editName,
          slug: editSlug,
          description: editDescription,
          sortOrder: editSortOrder,
          isActive: editIsActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subservice");

      setEditingId(null);
      router.refresh();
      const parentCat = categories.find((c) => c.id === editCategoryId) || { id: editCategoryId, name: "" };
      setSubservices((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...data.subservice, category: parentCat } : s
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  function startEdit(s: Subservice) {
    setEditingId(s.id);
    setEditCategoryId(s.categoryId);
    setEditName(s.name);
    setEditSlug(s.slug);
    setEditDescription(s.description || "");
    setEditSortOrder(s.sortOrder);
    setEditIsActive(s.isActive);
  }

  const filteredSubservices = subservices.filter(
    (s) => !selectedFilterCategory || s.categoryId === selectedFilterCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[18px] font-bold text-forest">Manage Subservices</h2>
          <select
            className="input text-[13px] py-1 px-3 w-48"
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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary text-[13px] py-2 flex items-center gap-1.5 self-end sm:self-auto"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Subservice"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[13px] font-semibold">
          ⚠️ {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="card space-y-4 border border-primary/20 bg-surface">
          <h3 className="font-bold text-[15px] text-forest">New Service Subservice</h3>
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
              className="input w-full text-[13px] min-h-[70px]"
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
              Create Subservice
            </button>
          </div>
        </form>
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
              {filteredSubservices.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="border-t hover:bg-surface-container-lowest transition-colors" style={{ borderColor: "var(--line)" }}>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input text-[13px] py-1 px-2 w-full max-w-[180px]"
                          value={editName}
                          onChange={(e) => handleEditNameChange(e.target.value)}
                        />
                      ) : (
                        <span className="font-semibold text-forest">{s.name}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className="input text-[13px] py-1 px-2 w-full max-w-[160px]"
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)}
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate font-semibold text-[13px]">{s.category.name}</span>
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
                        <span className="text-slate font-mono text-[12px]">{s.slug}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="input text-[13px] py-1 px-2 w-16"
                          value={editSortOrder}
                          onChange={(e) => setEditSortOrder(Number(e.target.value))}
                        />
                      ) : (
                        <span className="text-slate">{s.sortOrder}</span>
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
                        <span className={`badge ${s.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"} border px-2 py-0.5 rounded-full text-[11px] font-bold`}>
                          {s.isActive ? "active" : "hidden"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdate(s.id)}
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
                            onClick={() => startEdit(s)}
                            className="p-1.5 text-slate hover:text-primary hover:bg-surface-container rounded-lg transition"
                            title="Edit Subservice"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-slate hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Subservice"
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
