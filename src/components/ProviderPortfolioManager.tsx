"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PortfolioItem {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
}

export default function ProviderPortfolioManager({ initialItems }: { initialItems: PortfolioItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setMessage(null);

    try {
      const data = new FormData();
      data.append("action", "ADD");
      data.append("title", title);
      if (description) data.append("description", description);
      data.append("imageFile", imageFile);

      const res = await fetch("/api/provider/portfolio", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setImageFile(null);
        setImagePreview(null);
        setMessage({ text: "Portfolio item added successfully!", error: false });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to add portfolio item.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred.", error: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch("/api/provider/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE",
          id,
        }),
      });

      if (res.ok) {
        setMessage({ text: "Portfolio item deleted successfully!", error: false });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Failed to delete portfolio item.", error: true });
      }
    } catch {
      setMessage({ text: "An error occurred.", error: true });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Item Form */}
      <form onSubmit={handleAdd} className="card max-w-[640px] space-y-4">
        <h2 className="text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
          Add Portfolio Work Sample
        </h2>
        
        <div>
          <label className="label">Work Title</label>
          <input
            required
            className="input"
            placeholder="e.g. Electrical rewiring at Vidyanagar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="label">Description (Optional)</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Briefly explain the scope of work completed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="label">Upload Work Photo</label>
          <div className="flex items-center gap-4">
            <label className="btn btn-ghost text-[13px] py-1.5 px-4 cursor-pointer" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
              Choose Image File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                }}
                disabled={loading}
              />
            </label>
            <span className="text-[13px]" style={{ color: "var(--slate)" }}>
              {imageFile ? imageFile.name : "No file selected"}
            </span>
          </div>
        </div>

        {imagePreview && (
          <div className="mt-2">
            <p className="label">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="h-40 w-full rounded-lg object-cover border"
              style={{ borderColor: "var(--line)" }}
            />
          </div>
        )}

        {message && (
          <p
            className="text-[14px] font-semibold"
            style={{ color: message.error ? "#a32d2d" : "var(--emerald)" }}
          >
            {message.text}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Adding..." : "Add Work Sample"}
        </button>
      </form>

      {/* Existing Items Grid */}
      <div>
        <h2 className="mb-4 text-[18px] font-semibold" style={{ color: "var(--forest)" }}>
          Your Portfolio Gallery
        </h2>

        {initialItems.length === 0 ? (
          <div className="card text-[15px]" style={{ color: "var(--slate)" }}>
            No portfolio items added yet. Complete the form above to add your first work sample.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initialItems.map((item) => (
              <div key={item.id} className="card !p-0 overflow-hidden flex flex-col justify-between">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title ?? "Work sample"}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="text-[15px] font-semibold" style={{ color: "var(--forest)" }}>
                      {item.title ?? "Work sample"}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-[13px]" style={{ color: "var(--slate)" }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t" style={{ borderColor: "var(--line)" }}>
                  <button
                    className="btn btn-ghost w-full !py-1.5 !text-[13px]"
                    style={{ color: "#a32d2d", borderColor: "var(--line)" }}
                    disabled={deletingId !== null}
                    onClick={() => handleDelete(item.id)}
                  >
                    {deletingId === item.id ? "Deleting…" : "Delete Work Sample"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
