import { Player } from "@/types";

const STORAGE_KEY = "simulao_save_v1";

export interface SaveData {
  player: Player;
  year: number;
  newsFeed: import("@/types").NewsItem[];
}

export function saveGame(data: SaveData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadGame(): SaveData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
