import { InjuryEvent, Player } from "@/types";
import { chance, weightedPick } from "@/lib/random";

const INJURY_TYPES: { type: string; weight: number; severityBias: number }[] = [
  { type: "Tornozelo", weight: 25, severityBias: 0 },
  { type: "Joelho", weight: 15, severityBias: 1 },
  { type: "Ombro", weight: 10, severityBias: 0 },
  { type: "Costas", weight: 10, severityBias: 0 },
  { type: "Tendão", weight: 12, severityBias: 1 },
  { type: "Fratura", weight: 8, severityBias: 2 },
  { type: "Lesão muscular", weight: 20, severityBias: -1 },
  { type: "Concussão", weight: 5, severityBias: 0 },
];

function rollSeverity(bias: number): InjuryEvent["severity"] {
  const roll = Math.random() * 100 + bias * 10;
  if (roll < 55) return "minor";
  if (roll < 88) return "moderate";
  return "severe";
}

const GAMES_LOST: Record<InjuryEvent["severity"], [number, number]> = {
  minor: [1, 6],
  moderate: [7, 20],
  severe: [21, 60],
};

export function maybeGenerateInjury(player: Player): InjuryEvent | null {
  // Risco baseado em durabilidade, idade, minutos acumulados e histórico recorrente.
  const ageFactor = player.age > 30 ? (player.age - 30) * 1.5 : 0;
  const durabilityFactor = (100 - player.attributes.durability) * 0.4;
  const baseRisk = 8 + ageFactor + durabilityFactor;

  if (!chance(Math.min(baseRisk, 45))) return null;

  const typeDef = weightedPick(
    INJURY_TYPES.map((t) => ({ value: t, weight: t.weight }))
  );
  const severity = rollSeverity(typeDef.severityBias);
  const [minGames, maxGames] = GAMES_LOST[severity];
  const gamesLost = Math.round(minGames + Math.random() * (maxGames - minGames));

  const recurring = player.injuriesCareer.some(
    (i) => i.type === typeDef.type && i.severity !== "minor"
  );

  return {
    type: typeDef.type,
    severity,
    gamesLost,
    recurring,
  };
}

export function applyInjuryEffects(player: Player, injury: InjuryEvent): Player {
  const severityImpact = { minor: 1, moderate: 4, severe: 9 }[injury.severity];
  const recurringPenalty = injury.recurring ? 1.5 : 1;

  const attributes = { ...player.attributes };
  attributes.health = Math.max(20, attributes.health - severityImpact * 5);
  attributes.durability = Math.max(
    10,
    attributes.durability - severityImpact * recurringPenalty
  );
  attributes.athleticism = Math.max(
    10,
    attributes.athleticism - Math.round(severityImpact * recurringPenalty * 0.6)
  );

  return {
    ...player,
    attributes,
    morale: Math.max(0, player.morale - severityImpact * 3),
    injuriesCareer: [...player.injuriesCareer, injury],
  };
}
