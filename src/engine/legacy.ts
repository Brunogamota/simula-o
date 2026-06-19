import { LegacyTier, Player } from "@/types";
import { weightedPick } from "@/lib/random";

/**
 * Determina o tier de legado final do jogador. A distribuição é ponderada
 * pela produção de carreira real obtida na simulação, mas inclui um fator
 * de "sorte" controlado para impedir que toda carreira convirja para o topo.
 */
export function calculateLegacyTier(player: Player): LegacyTier {
  const seasons = player.seasons;
  if (seasons.length === 0) return "never_stuck";

  const careerGames = seasons.reduce((s, x) => s + x.gamesPlayed, 0);
  const avgPpg = seasons.reduce((s, x) => s + x.ppg, 0) / seasons.length;
  const avgRating = seasons.reduce((s, x) => s + x.rating, 0) / seasons.length;
  const awards = player.awardsCareer.length;
  const allStarCount = player.awardsCareer.filter((a) => a.includes("All-Star")).length;
  const championships = player.awardsCareer.filter((a) => a.includes("Champion")).length;

  const score =
    avgPpg * 1.2 +
    avgRating * 1.5 +
    awards * 4 +
    allStarCount * 5 +
    championships * 8 +
    (careerGames > 600 ? 5 : 0);

  if (careerGames < 100 || avgRating < 5) {
    return weightedPick<LegacyTier>([
      { value: "never_stuck", weight: 70 },
      { value: "role_player", weight: 30 },
    ]);
  }

  if (score < 25) {
    return weightedPick<LegacyTier>([
      { value: "role_player", weight: 70 },
      { value: "solid_starter", weight: 30 },
    ]);
  }
  if (score < 45) {
    return weightedPick<LegacyTier>([
      { value: "solid_starter", weight: 65 },
      { value: "good_player", weight: 35 },
    ]);
  }
  if (score < 65) {
    return weightedPick<LegacyTier>([
      { value: "good_player", weight: 60 },
      { value: "occasional_allstar", weight: 40 },
    ]);
  }
  if (score < 90) {
    return weightedPick<LegacyTier>([
      { value: "occasional_allstar", weight: 55 },
      { value: "superstar", weight: 45 },
    ]);
  }
  return weightedPick<LegacyTier>([
    { value: "superstar", weight: 70 },
    { value: "historic_legend", weight: 30 },
  ]);
}

export function checkHallOfFame(player: Player, tier: LegacyTier): boolean {
  return tier === "superstar" || tier === "historic_legend";
}

export const LEGACY_LABELS: Record<LegacyTier, string> = {
  never_stuck: "Não se firmou na liga",
  role_player: "Role player",
  solid_starter: "Titular sólido",
  good_player: "Bom jogador",
  occasional_allstar: "All-Star ocasional",
  superstar: "Superstar",
  historic_legend: "Lenda histórica",
};
