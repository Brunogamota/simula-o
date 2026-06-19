import { create } from "zustand";
import { GameEvent, NewsItem, NpcPersona, Player, SeasonPhase } from "@/types";
import { CreatePlayerInput, createPlayer } from "@/engine/player";
import { advanceWeek, ensureStaff } from "@/engine/game";
import { computeNarrativeTag } from "@/engine/storylines";
import { loadGame, saveGame, clearGame } from "@/lib/storage";
import { pick, randInt } from "@/lib/random";

const TRAINABLE_ATTRS: (keyof Player["attributes"])[] = [
  "shooting",
  "finishing",
  "ballHandling",
  "defense",
  "athleticism",
  "basketballIQ",
];

interface GameStore {
  player: Player | null;
  year: number;
  week: number;
  phase: SeasonPhase;
  coach?: NpcPersona;
  agent?: NpcPersona;
  owner?: NpcPersona;
  newsFeed: NewsItem[];
  pendingEvents: GameEvent[];
  activeEvent: GameEvent | null;
  hydrated: boolean;
  hydrate: () => void;
  startNewCareer: (input: CreatePlayerInput) => void;
  advance: () => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  openEvent: (eventId: string) => void;
  closeEvent: () => void;
  resetGame: () => void;
  train: () => void;
  talkToCoach: () => void;
}

function persist(s: GameStore) {
  if (!s.player) return;
  saveGame({
    player: s.player,
    year: s.year,
    week: s.week,
    phase: s.phase,
    coach: s.coach,
    agent: s.agent,
    owner: s.owner,
    newsFeed: s.newsFeed,
  });
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  year: new Date().getFullYear(),
  week: 1,
  phase: "offseason",
  newsFeed: [],
  pendingEvents: [],
  activeEvent: null,
  hydrated: false,

  hydrate: () => {
    const data = loadGame();
    if (data) {
      set({
        player: data.player,
        year: data.year,
        week: data.week ?? 1,
        phase: data.phase ?? "offseason",
        coach: data.coach,
        agent: data.agent,
        owner: data.owner,
        newsFeed: data.newsFeed,
        pendingEvents: [],
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },

  startNewCareer: (input) => {
    const player = createPlayer(input);
    const year = new Date().getFullYear();
    const next = {
      player,
      year,
      week: 1,
      phase: "offseason" as SeasonPhase,
      newsFeed: [],
      pendingEvents: [],
      activeEvent: null,
      coach: undefined,
      agent: undefined,
      owner: undefined,
    };
    set(next);
    persist({ ...get(), ...next });
  },

  advance: () => {
    const state = get();
    if (!state.player || state.pendingEvents.length > 0) return;

    const staffed = ensureStaff({
      player: state.player,
      year: state.year,
      week: state.week,
      phase: state.phase,
      coach: state.coach,
      agent: state.agent,
      owner: state.owner,
    });

    const result = advanceWeek(staffed);
    const updatedFeed = [...result.news, ...state.newsFeed].slice(0, 300);

    set({
      player: result.player,
      year: result.year,
      week: result.week,
      phase: result.phase,
      coach: result.coach,
      agent: result.agent,
      owner: result.owner,
      newsFeed: updatedFeed,
      pendingEvents: [...state.pendingEvents, ...result.events],
    });
    persist(get());
  },

  openEvent: (eventId) => {
    const event = get().pendingEvents.find((e) => e.id === eventId) ?? null;
    set({ activeEvent: event });
  },

  closeEvent: () => set({ activeEvent: null }),

  resolveEvent: (eventId, choiceId) => {
    const state = get();
    if (!state.player) return;
    const event = state.pendingEvents.find((e) => e.id === eventId);
    if (!event) return;
    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    const result = choice.apply(state.player, {
      team: undefined,
      coach: state.coach,
      agent: state.agent,
      owner: state.owner,
      year: state.year,
      week: state.week,
    });

    let player = result.player;
    if (result.moraleDelta) {
      player = { ...player, morale: Math.max(0, Math.min(100, player.morale + result.moraleDelta)) };
    }
    player = { ...player, narrativeTag: computeNarrativeTag(player) };

    const news = result.news ?? [];
    const remainingEvents = state.pendingEvents.filter((e) => e.id !== eventId);

    set({
      player,
      newsFeed: [...news, ...state.newsFeed].slice(0, 300),
      pendingEvents: remainingEvents,
      activeEvent: null,
    });
    persist(get());
  },

  train: () => {
    const state = get();
    if (!state.player) return;
    const attr = pick(TRAINABLE_ATTRS);
    const gain = randInt(1, 2);
    const player: Player = {
      ...state.player,
      attributes: {
        ...state.player.attributes,
        [attr]: Math.min(100, state.player.attributes[attr] + gain),
      },
      morale: Math.max(0, state.player.morale - randInt(1, 4)),
    };
    const news: NewsItem = {
      id: `news_${Date.now()}_${randInt(1000, 9999)}`,
      year: state.year,
      outlet: "Treino",
      headline: `${player.name} intensifica os treinos`,
      body: `Sessões extras de treino miram evolução em ${attr}.`,
      category: "social_buzz",
      disclaimer: "",
    };
    set({ player, newsFeed: [news, ...state.newsFeed].slice(0, 300) });
    persist(get());
  },

  talkToCoach: () => {
    const state = get();
    if (!state.player || !state.coach) return;
    const friendly = state.coach.temperament === "supportive" || state.coach.patience > 60;
    const moraleDelta = friendly ? randInt(3, 8) : randInt(-3, 3);
    const player: Player = {
      ...state.player,
      morale: Math.max(0, Math.min(100, state.player.morale + moraleDelta)),
    };
    const news: NewsItem = {
      id: `news_${Date.now()}_${randInt(1000, 9999)}`,
      year: state.year,
      outlet: "Bastidores",
      headline: `${player.name} conversa com o técnico ${state.coach.name}`,
      body:
        moraleDelta >= 0
          ? `A conversa foi produtiva e deixou ${player.name} mais confiante.`
          : `A conversa foi tensa e deixou um clima estranho no vestiário.`,
      category: "social_buzz",
      disclaimer: "",
    };
    set({ player, newsFeed: [news, ...state.newsFeed].slice(0, 300) });
    persist(get());
  },

  resetGame: () => {
    clearGame();
    set({
      player: null,
      year: new Date().getFullYear(),
      week: 1,
      phase: "offseason",
      newsFeed: [],
      pendingEvents: [],
      activeEvent: null,
      coach: undefined,
      agent: undefined,
      owner: undefined,
    });
  },
}));
