import { Player, SeasonStats, Team } from "@/types";
import { clamp, gaussian, randInt } from "@/lib/random";
import { maybeGenerateInjury, applyInjuryEffects } from "./injuries";

/** Calcula o "papel" do jogador no time com base em atributos e idade. */
function calcRoleFactor(player: Player): number {
  const overall =
    (player.attributes.shooting +
      player.attributes.finishing +
      player.attributes.ballHandling +
      player.attributes.passing +
      player.attributes.defense +
      player.attributes.rebounding +
      player.attributes.basketballIQ) /
    7;
  const ageFactor = player.age < 24 ? 0.85 : player.age > 33 ? 0.85 : 1;
  return clamp(overall * ageFactor, 5, 100);
}

function simulateTeamRecord(team: Team | undefined): { wins: number; losses: number } {
  if (!team) {
    const wins = randInt(20, 45);
    return { wins, losses: 82 - wins };
  }
  const base = team.winningHistory * 0.5 + team.capSpaceApprox * 0.1;
  const wins = clamp(Math.round(gaussian(base, 8)), 10, 70);
  return { wins, losses: 82 - wins };
}

export function simulateSeason(
  player: Player,
  team: Team | undefined,
  year: number
): { player: Player; season: SeasonStats } {
  const roleFactor = calcRoleFactor(player);
  const minutesPerGame = clamp(8 + roleFactor * 0.32, 6, 38);

  const healthFactor = player.attributes.health / 100;
  let gamesPlayed = Math.round(clamp(gaussian(70 * healthFactor, 8), 10, 82));

  const ppg = clamp(
    gaussian(
      (player.attributes.shooting * 0.5 + player.attributes.finishing * 0.5) *
        (minutesPerGame / 32) *
        0.45,
      2.5
    ),
    0,
    45
  );
  const rpg = clamp(
    gaussian(player.attributes.rebounding * (minutesPerGame / 32) * 0.16, 1.2),
    0,
    18
  );
  const apg = clamp(
    gaussian(player.attributes.passing * (minutesPerGame / 32) * 0.13, 1.2),
    0,
    14
  );
  const spg = clamp(gaussian(player.attributes.defense * 0.025, 0.3), 0, 4);
  const bpg = clamp(gaussian(player.attributes.defense * 0.018, 0.25), 0, 4);
  const fgPct = clamp(
    gaussian(40 + player.attributes.finishing * 0.2, 4),
    30,
    70
  );
  const threePct = clamp(gaussian(28 + player.attributes.shooting * 0.18, 5), 10, 50);
  const ftPct = clamp(gaussian(60 + player.attributes.shooting * 0.25, 6), 40, 95);
  const turnovers = clamp(
    gaussian(1 + (100 - player.attributes.ballHandling) * 0.03, 0.6),
    0,
    6
  );

  const rating = clamp(
    Math.round(
      (ppg * 1.0 +
        rpg * 1.2 +
        apg * 1.5 +
        spg * 3 +
        bpg * 3 -
        turnovers * 1.5 +
        player.attributes.basketballIQ * 0.1) *
        1.0
    ),
    0,
    50
  );

  const teamRecord = simulateTeamRecord(team);
  const winPct = teamRecord.wins / 82;
  const madePlayoffs = winPct > 0.45 && Math.random() < winPct + 0.1;

  let updatedPlayer = { ...player };
  const injuries = [];
  const injury = maybeGenerateInjury(updatedPlayer);
  if (injury) {
    updatedPlayer = applyInjuryEffects(updatedPlayer, injury);
    gamesPlayed = Math.max(5, gamesPlayed - injury.gamesLost);
    injuries.push(injury);
  }

  const moraleShift =
    (ppg > 15 ? 3 : 0) + (madePlayoffs ? 5 : -3) + (gamesPlayed < 40 ? -5 : 0);
  const morale = clamp(updatedPlayer.morale + moraleShift, 0, 100);

  const marketValue = clamp(
    rating * 1.5 + updatedPlayer.attributes.popularity * 0.3 + updatedPlayer.attributes.marketability * 0.2,
    0,
    100
  );

  const season: SeasonStats = {
    year,
    age: updatedPlayer.age,
    teamId: team?.id ?? null,
    gamesPlayed,
    minutesPerGame: Math.round(minutesPerGame * 10) / 10,
    ppg: Math.round(ppg * 10) / 10,
    rpg: Math.round(rpg * 10) / 10,
    apg: Math.round(apg * 10) / 10,
    spg: Math.round(spg * 10) / 10,
    bpg: Math.round(bpg * 10) / 10,
    fgPct: Math.round(fgPct * 10) / 10,
    threePct: Math.round(threePct * 10) / 10,
    ftPct: Math.round(ftPct * 10) / 10,
    turnovers: Math.round(turnovers * 10) / 10,
    rating,
    teamRecord,
    madePlayoffs,
    awards: [],
    injuries,
    moraleEnd: morale,
    marketValueEnd: marketValue,
  };

  updatedPlayer = {
    ...updatedPlayer,
    seasons: [...updatedPlayer.seasons, season],
    morale,
    marketValue,
  };

  return { player: updatedPlayer, season };
}

/** Evolui atributos com base em idade, treino (ética de trabalho) e minutos jogados. */
export function progressAttributes(player: Player): Player {
  const attrs = { ...player.attributes };
  const age = player.age;

  let growthPhase: "rising" | "peak" | "declining";
  if (age < 27) growthPhase = "rising";
  else if (age <= 32) growthPhase = "peak";
  else growthPhase = "declining";

  const workEthicFactor = attrs.workEthic / 100;
  const potentialRoom = (attrs.potential - 50) / 50;

  const keys: (keyof typeof attrs)[] = [
    "shooting",
    "finishing",
    "ballHandling",
    "passing",
    "defense",
    "rebounding",
    "basketballIQ",
  ];

  for (const key of keys) {
    let delta = 0;
    if (growthPhase === "rising") {
      delta = (1 + workEthicFactor * 2 + potentialRoom) * (Math.random() * 0.8 + 0.6);
    } else if (growthPhase === "peak") {
      delta = (workEthicFactor - 0.4) * 1.2;
    } else {
      delta = -1 * (1 + (age - 32) * 0.2) * (1 - workEthicFactor * 0.4);
    }
    attrs[key] = clamp(Math.round(attrs[key] + delta));
  }

  if (growthPhase === "declining") {
    attrs.athleticism = clamp(attrs.athleticism - (age - 32) * 1.5);
    attrs.durability = clamp(attrs.durability - 1);
  }

  attrs.health = clamp(attrs.health + (100 - attrs.health) * 0.3);

  return { ...player, attributes: attrs, age: player.age + 1 };
}
