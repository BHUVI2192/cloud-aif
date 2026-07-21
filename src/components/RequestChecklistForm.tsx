"use client";
import { useState, useEffect } from "react";

interface RequestChecklistFormProps {
  requestId: string;
  isProvider?: boolean;
}

export default function RequestChecklistForm({ requestId, isProvider }: RequestChecklistFormProps) {
  const [template, setTemplate] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, { boolValue?: boolean; textValue?: string; numberValue?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchChecklist = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}/checklist`);
      const data = await res.json();
      if (res.ok && data.template) {
        setTemplate(data.template);
        const initAnswers: Record<string, any> = {};
        if (data.responses) {
          data.responses.forEach((r: any) => {
            initAnswers[r.itemId] = {
              boolValue: r.boolValue,
              textValue: r.textValue,
              numberValue: r.numberValue,
            };
          });
        }
        setAnswers(initAnswers);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [requestId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([itemId, val]) => ({
        itemId,
        ...val,
      }));
      const res = await fetch(`/api/requests/${requestId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !template || !template.items || template.items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h4 className="font-display text-base font-bold text-slate-900">📋 Service Completion Checklist</h4>
          {template.title && <p className="text-xs text-slate-500">{template.title}</p>}
        </div>
        {saved && <span className="text-xs font-bold text-emerald-600">Saved successfully!</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {template.items.map((item: any) => {
          const currentVal = answers[item.id] || {};

          return (
            <div key={item.id} className="flex flex-col gap-1.5 rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{item.label} {item.isRequired && <span className="text-red-500">*</span>}</span>
                
                {item.type === "BOOLEAN" && (
                  <input
                    type="checkbox"
                    disabled={!isProvider}
                    checked={!!currentVal.boolValue}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [item.id]: { ...prev[item.id], boolValue: e.target.checked } }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                )}
              </div>

              {item.type === "TEXT" && (
                <input
                  type="text"
                  disabled={!isProvider}
                  value={currentVal.textValue || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [item.id]: { ...prev[item.id], textValue: e.target.value } }))
                  }
                  placeholder="Enter details..."
                  className="rounded-lg border border-slate-300 p-2 focus:border-emerald-600 focus:outline-none"
                />
              )}

              {item.type === "NUMERIC" && (
                <input
                  type="number"
                  disabled={!isProvider}
                  value={currentVal.numberValue ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [item.id]: { ...prev[item.id], numberValue: parseFloat(e.target.value) || 0 } }))
                  }
                  placeholder="0.0"
                  className="rounded-lg border border-slate-300 p-2 focus:border-emerald-600 focus:outline-none"
                />
              )}
            </div>
          );
        })}

        {isProvider && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary text-xs !py-2 !px-4"
            >
              {isSubmitting ? "Saving..." : "Save Checklist Responses"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
