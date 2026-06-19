import { Player, PlayerNarrativeTag } from "@/types";

/** Recalcula a narrativa pública do jogador a partir do estado atual da carreira. */
export function computeNarrativeTag(player: Player): PlayerNarrativeTag {
  const seasons = player.seasons;
  const lastSeason = seasons[seasons.length - 1];
  const championships = player.awardsCareer.filter((a) => a.includes("Champion")).length;
  const allStars = player.awardsCareer.filter((a) => a.includes("All-Star")).length;
  const careerGames = seasons.reduce((s, x) => s + x.gamesPlayed, 0);
  const avgPpg = seasons.length ? seasons.reduce((s, x) => s + x.ppg, 0) / seasons.length : 0;

  if (seasons.length === 0) return "unproven";

  if (player.draftProfile && player.draftProfile.mockRank <= 5 && careerGames < 120 && avgPpg < 10) {
    return "bust_watch";
  }
  if (player.attributes.popularity > 80 && player.age < 25 && avgPpg > 18) {
    return "next_great_thing";
  }
  if (player.attributes.loyalty < 30 && player.contracts.length >= 3) {
    return "mercenary";
  }
  if (player.attributes.popularity < 25 && player.morale < 40) {
    return "most_hated";
  }
  if (player.attributes.leadership > 75) {
    return "locker_room_leader";
  }
  if (player.attributes.basketballIQ > 80 && player.attributes.popularity < 50) {
    return "misunderstood_genius";
  }
  if (lastSeason?.madePlayoffs && lastSeason.ppg > 22 && championships === 0 && seasons.length > 5) {
    return "playoff_king";
  }
  if (seasons.length > 8 && championships === 0 && (allStars > 2 || avgPpg > 20)) {
    return "ringless";
  }
  if (player.attributes.defense > 85) {
    return "best_defender";
  }
  if (player.attributes.popularity > 60) {
    return "fan_favorite";
  }
  return "unproven";
}
