import { create } from "zustand";
import { NewsItem, Player } from "@/types";
import { CreatePlayerInput, createPlayer } from "@/engine/player";
import { advanceYear } from "@/engine/game";
import { decisionsForPhase } from "@/engine/decisions";
import { Decision } from "@/types";
import { loadGame, saveGame, clearGame } from "@/lib/storage";

interface GameStore {
  player: Player | null;
  year: number;
  newsFeed: NewsItem[];
  lastYearNews: NewsItem[];
  hydrated: boolean;
  hydrate: () => void;
  startNewCareer: (input: CreatePlayerInput) => void;
  advance: () => void;
  applyDecision: (decisionId: string) => void;
  availableDecisions: () => Decision[];
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  year: new Date().getFullYear(),
  newsFeed: [],
  lastYearNews: [],
  hydrated: false,

  hydrate: () => {
    const data = loadGame();
    if (data) {
      set({ player: data.player, year: data.year, newsFeed: data.newsFeed, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  startNewCareer: (input) => {
    const player = createPlayer(input);
    const year = new Date().getFullYear();
    set({ player, year, newsFeed: [], lastYearNews: [] });
    saveGame({ player, year, newsFeed: [] });
  },

  advance: () => {
    const { player, year, newsFeed } = get();
    if (!player) return;
    const result = advanceYear(player, year);
    const nextYear = year + 1;
    const updatedFeed = [...result.news, ...newsFeed].slice(0, 200);
    set({ player: result.player, year: nextYear, newsFeed: updatedFeed, lastYearNews: result.news });
    saveGame({ player: result.player, year: nextYear, newsFeed: updatedFeed });
  },

  applyDecision: (decisionId) => {
    const { player, year, newsFeed } = get();
    if (!player) return;
    const decision = decisionsForPhase(player.phase).find((d) => d.id === decisionId);
    if (!decision) return;
    const updated = decision.effects(player);
    set({ player: updated });
    saveGame({ player: updated, year, newsFeed });
  },

  availableDecisions: () => {
    const { player } = get();
    if (!player) return [];
    return decisionsForPhase(player.phase);
  },

  resetGame: () => {
    clearGame();
    set({ player: null, year: new Date().getFullYear(), newsFeed: [], lastYearNews: [] });
  },
}));
