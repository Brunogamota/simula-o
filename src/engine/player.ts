import {
  Attributes,
  Hand,
  Personality,
  Player,
  PlayStyle,
  Position,
  SocialBackground,
} from "@/types";
import { clamp, gaussian, randInt } from "@/lib/random";

export interface CreatePlayerInput {
  name: string;
  nationality: string;
  startAge: number;
  heightCm: number;
  weightKg: number;
  position: Position;
  playStyle: PlayStyle;
  background: SocialBackground;
  dominantHand: Hand;
  personality: Personality;
  potential: number; // 0-100, definido na criação
  injuryRisk: number; // 0-100
  workEthic: number; // 0-100
}

const STYLE_BIAS: Record<PlayStyle, Partial<Attributes>> = {
  scorer: { shooting: 8, finishing: 6, ego: 5 },
  playmaker: { passing: 10, ballHandling: 8, basketballIQ: 4 },
  defender: { defense: 10, strength: 5, discipline: 4 },
  shooter: { shooting: 12, marketability: 3 },
  athletic_wing: { athleticism: 10, finishing: 4 },
  two_way: { defense: 6, shooting: 4, basketballIQ: 4 },
  big_man: { strength: 10, rebounding: 8, finishing: 4 },
  stretch_big: { strength: 6, shooting: 8, rebounding: 4 },
};

function baseAttribute(mean = 45, stdDev = 10): number {
  return clamp(Math.round(gaussian(mean, stdDev)));
}

export function createPlayer(input: CreatePlayerInput): Player {
  const bias = STYLE_BIAS[input.playStyle] ?? {};

  const attributes: Attributes = {
    shooting: clamp(baseAttribute() + (bias.shooting ?? 0)),
    finishing: clamp(baseAttribute() + (bias.finishing ?? 0)),
    ballHandling: clamp(baseAttribute() + (bias.ballHandling ?? 0)),
    passing: clamp(baseAttribute() + (bias.passing ?? 0)),
    defense: clamp(baseAttribute() + (bias.defense ?? 0)),
    rebounding: clamp(baseAttribute() + (bias.rebounding ?? 0)),
    athleticism: clamp(baseAttribute() + (bias.athleticism ?? 0)),
    strength: clamp(baseAttribute() + (bias.strength ?? 0)),
    basketballIQ: clamp(baseAttribute() + (bias.basketballIQ ?? 0)),
    leadership: clamp(baseAttribute(40, 12)),
    workEthic: clamp(input.workEthic),
    discipline: clamp(baseAttribute(50, 10) + (bias.discipline ?? 0)),
    popularity: clamp(baseAttribute(30, 10)),
    health: 100,
    potential: clamp(input.potential),
    clutch: clamp(baseAttribute(40, 15)),
    durability: clamp(100 - input.injuryRisk),
    marketability: clamp(baseAttribute(35, 12) + (bias.marketability ?? 0)),
    ego: clamp(baseAttribute(40, 12) + (bias.ego ?? 0)),
    loyalty: clamp(baseAttribute(50, 12)),
  };

  const currentYear = new Date().getFullYear();

  return {
    id: `player_${Date.now()}_${randInt(1000, 9999)}`,
    name: input.name,
    nationality: input.nationality,
    age: input.startAge,
    birthYear: currentYear - input.startAge,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    position: input.position,
    playStyle: input.playStyle,
    background: input.background,
    dominantHand: input.dominantHand,
    personality: input.personality,
    attributes,
    phase: "high_school",
    collegeYears: 0,
    currentTeamId: null,
    seasons: [],
    contracts: [],
    sponsorships: [],
    finance: {
      netWorth: 0,
      liquidCash: 0,
      totalEarnedSalary: 0,
      totalEarnedSponsorships: 0,
      totalTaxesPaid: 0,
      totalSpent: 0,
      investments: 0,
      businesses: [],
    },
    awardsCareer: [],
    injuriesCareer: [],
    morale: 70,
    marketValue: 10,
    newsFeed: [],
    retired: false,
    hallOfFame: false,
  };
}
