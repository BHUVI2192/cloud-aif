export interface OfflineAction {
  id: string;
  type: "STATUS_UPDATE" | "PROOF_UPLOAD" | "CHECKLIST_SUBMIT" | "LOCATION_PING";
  requestId?: string;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = "cloud_aif_offline_queue";

export function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineAction(action: Omit<OfflineAction, "id" | "timestamp">): OfflineAction {
  const item: OfflineAction = {
    ...action,
    id: `act_${Math.random().toString(36).substring(2, 10)}`,
    timestamp: Date.now(),
  };

  const current = getOfflineQueue();
  current.push(item);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  return item;
}

export function removeOfflineAction(id: string): void {
  if (typeof window === "undefined") return;
  const current = getOfflineQueue().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncOfflineQueue(): Promise<{ success: boolean; syncedCount: number; errors: any[] }> {
  const actions = getOfflineQueue();
  if (actions.length === 0) return { success: true, syncedCount: 0, errors: [] };

  try {
    const res = await fetch("/api/provider/offline-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions }),
    });

    if (res.ok) {
      clearOfflineQueue();
      return { success: true, syncedCount: actions.length, errors: [] };
    } else {
      const errData = await res.json();
      return { success: false, syncedCount: 0, errors: [errData.error || "Sync failed"] };
    }
  } catch (err) {
    return { success: false, syncedCount: 0, errors: [String(err)] };
  }
}
