import { Journalist, MediaOutlet } from "@/types";

// Veículos e jornalistas reais usados apenas como referência narrativa/simulativa.
// Todo conteúdo gerado é FICTÍCIO e não representa declarações reais dessas pessoas.
export const OUTLETS: MediaOutlet[] = [
  { id: "espn", name: "ESPN", tone: "balanced" },
  { id: "athletic", name: "The Athletic", tone: "analytical" },
  { id: "br", name: "Bleacher Report", tone: "sensational" },
  { id: "nbatv", name: "NBA TV", tone: "balanced" },
  { id: "tnt", name: "TNT", tone: "sensational" },
  { id: "yahoo", name: "Yahoo Sports", tone: "balanced" },
  { id: "cbs", name: "CBS Sports", tone: "analytical" },
  { id: "si", name: "Sports Illustrated", tone: "analytical" },
  { id: "ringer", name: "The Ringer", tone: "insider" },
  { id: "twitter", name: "X (Twitter)", tone: "sensational" },
  { id: "reddit", name: "Reddit r/nba", tone: "sensational" },
];

export const JOURNALISTS: Journalist[] = [
  { id: "wojnarowski", name: "Adrian Wojnarowski", outletId: "espn", specialty: "rumors" },
  { id: "shams", name: "Shams Charania", outletId: "athletic", specialty: "rumors" },
  { id: "stephen_a", name: "Stephen A. Smith", outletId: "espn", specialty: "debate" },
  { id: "perkins", name: "Kendrick Perkins", outletId: "espn", specialty: "debate" },
  { id: "windhorst", name: "Brian Windhorst", outletId: "espn", specialty: "analysis" },
  { id: "lowe", name: "Zach Lowe", outletId: "espn", specialty: "analysis" },
  { id: "shelburne", name: "Ramona Shelburne", outletId: "espn", specialty: "analysis" },
  { id: "bontemps", name: "Tim Bontemps", outletId: "espn", specialty: "analysis" },
  { id: "stein", name: "Marc Stein", outletId: "si", specialty: "rumors" },
  { id: "haynes", name: "Chris Haynes", outletId: "yahoo", specialty: "rumors" },
  { id: "simmons", name: "Bill Simmons", outletId: "ringer", specialty: "debate" },
];

export const NARRATIVE_DISCLAIMER =
  "Simulação fictícia inspirada no tom da mídia esportiva. Não representa uma declaração real.";
