import { NewsItem, NpcPersona, Player, SeasonPhase } from "@/types";

const STORAGE_KEY = "simulao_save_v2";

// pendingEvents não é persistido: GameEvent.choices contém funções (apply),
// que não sobrevivem a JSON.stringify. Eventos em aberto são perdidos ao
// recarregar a página — uma limitação aceitável para o MVP.
export interface SaveData {
  player: Player;
  year: number;
  week: number;
  phase: SeasonPhase;
  coach?: NpcPersona;
  agent?: NpcPersona;
  owner?: NpcPersona;
  newsFeed: NewsItem[];
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
