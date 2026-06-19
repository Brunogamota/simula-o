import { DraftProfile, Player } from "@/types";
import { clamp, gaussian, weightedPick } from "@/lib/random";

export function generateDraftProfile(player: Player): DraftProfile {
  const lastSeason = player.seasons[player.seasons.length - 1];
  const productionScore = lastSeason
    ? lastSeason.ppg * 1.2 + lastSeason.rpg + lastSeason.apg * 1.5 + lastSeason.rating * 0.5
    : 0;

  const overall =
    (player.attributes.shooting +
      player.attributes.finishing +
      player.attributes.ballHandling +
      player.attributes.passing +
      player.attributes.defense +
      player.attributes.rebounding +
      player.attributes.athleticism +
      player.attributes.basketballIQ) /
    8;

  const combineScore = clamp(
    Math.round(gaussian(player.attributes.athleticism * 0.8 + overall * 0.2, 8))
  );
  const workoutGrade = clamp(Math.round(gaussian(overall * 0.7 + combineScore * 0.3, 6)));
  const interviewGrade = clamp(
    Math.round(
      gaussian(
        50 +
          (player.personality === "media_friendly" ? 20 : 0) +
          (player.personality === "problematic" ? -20 : 0) +
          (player.personality === "leader" ? 10 : 0),
        10
      )
    )
  );

  const draftScore =
    overall * 0.4 +
    productionScore * 0.25 +
    combineScore * 0.15 +
    workoutGrade * 0.1 +
    interviewGrade * 0.05 +
    player.attributes.potential * 0.05;

  // Mapeia o score (aproximadamente 0-100) para um rank de mock draft (1-60+)
  const mockRank = clamp(Math.round(60 - draftScore * 0.55), 1, 80);

  const bustRisk = clamp(
    Math.round(
      100 -
        player.attributes.workEthic * 0.4 -
        player.attributes.discipline * 0.3 -
        player.attributes.basketballIQ * 0.2 +
        (player.attributes.ego > 70 ? 10 : 0)
    )
  );

  const stockTrend = weightedPick<DraftProfile["stockTrend"]>([
    { value: "rising", weight: 35 },
    { value: "falling", weight: 30 },
    { value: "stable", weight: 35 },
  ]);

  return { mockRank, combineScore, workoutGrade, interviewGrade, stockTrend, bustRisk };
}

export type DraftResult = {
  pick: number | "undrafted";
  round: 1 | 2 | null;
};

export function resolveDraftResult(profile: DraftProfile): DraftResult {
  let effectiveRank = profile.mockRank;
  if (profile.stockTrend === "rising") effectiveRank -= Math.round(Math.random() * 8);
  if (profile.stockTrend === "falling") effectiveRank += Math.round(Math.random() * 10);

  const bustSwing = (profile.bustRisk - 50) / 50;
  effectiveRank += Math.round(bustSwing * 8);

  effectiveRank = clamp(effectiveRank, 1, 90);

  if (effectiveRank > 60) {
    return { pick: "undrafted", round: null };
  }
  const round: 1 | 2 = effectiveRank <= 30 ? 1 : 2;
  return { pick: effectiveRank, round };
}
