// Tipos centrais da engine de simulação de carreira

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type PlayStyle =
  | "scorer"
  | "playmaker"
  | "defender"
  | "shooter"
  | "athletic_wing"
  | "two_way"
  | "big_man"
  | "stretch_big";

export type Personality =
  | "humble"
  | "confident"
  | "problematic"
  | "leader"
  | "reserved"
  | "media_friendly";

export type SocialBackground = "poor" | "middle_class" | "wealthy";

export type Hand = "left" | "right";

export interface Attributes {
  shooting: number;
  finishing: number;
  ballHandling: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  strength: number;
  basketballIQ: number;
  leadership: number;
  workEthic: number;
  discipline: number;
  popularity: number;
  health: number;
  potential: number;
  clutch: number;
  durability: number;
  marketability: number;
  ego: number;
  loyalty: number;
}

export type AttributeKey = keyof Attributes;

export type CareerPhase =
  | "high_school"
  | "college"
  | "draft"
  | "nba"
  | "free_agent"
  | "retired"
  | "post_career";

export interface SeasonStats {
  year: number;
  age: number;
  teamId: string | null;
  collegeId?: string;
  gamesPlayed: number;
  minutesPerGame: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
  turnovers: number;
  rating: number;
  teamRecord: { wins: number; losses: number };
  madePlayoffs: boolean;
  playoffStats?: Partial<SeasonStats>;
  awards: string[];
  injuries: InjuryEvent[];
  moraleEnd: number;
  marketValueEnd: number;
}

export interface InjuryEvent {
  type: string;
  severity: "minor" | "moderate" | "severe";
  gamesLost: number;
  recurring: boolean;
}

export type ContractType =
  | "rookie_scale"
  | "two_way"
  | "minimum"
  | "mid_level"
  | "extension"
  | "max"
  | "supermax"
  | "veteran";

export interface Contract {
  type: ContractType;
  teamId: string;
  years: number;
  totalValue: number;
  annualSalary: number[];
  playerOption: boolean;
  teamOption: boolean;
  noTradeClause: boolean;
  signedAtYear: number;
}

export interface Sponsorship {
  brand: string;
  category: "shoes" | "apparel" | "drink" | "tech" | "other";
  annualValue: number;
  startYear: number;
  active: boolean;
}

export interface FinanceState {
  netWorth: number;
  liquidCash: number;
  totalEarnedSalary: number;
  totalEarnedSponsorships: number;
  totalTaxesPaid: number;
  totalSpent: number;
  investments: number;
  businesses: string[];
}

export interface NewsItem {
  id: string;
  year: number;
  outlet: string;
  author?: string;
  headline: string;
  body: string;
  category:
    | "breaking"
    | "rumor"
    | "analysis"
    | "debate"
    | "mock_draft"
    | "ranking"
    | "criticism"
    | "legacy";
  disclaimer: string;
}

export interface DraftProfile {
  mockRank: number;
  combineScore: number;
  workoutGrade: number;
  interviewGrade: number;
  stockTrend: "rising" | "falling" | "stable";
  bustRisk: number;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  age: number;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  position: Position;
  playStyle: PlayStyle;
  background: SocialBackground;
  dominantHand: Hand;
  personality: Personality;
  attributes: Attributes;
  phase: CareerPhase;
  collegeId?: string;
  collegeYears: number;
  currentTeamId: string | null;
  draftProfile?: DraftProfile;
  draftYear?: number;
  draftPick?: number | "undrafted";
  seasons: SeasonStats[];
  contracts: Contract[];
  sponsorships: Sponsorship[];
  finance: FinanceState;
  awardsCareer: string[];
  injuriesCareer: InjuryEvent[];
  morale: number;
  marketValue: number;
  newsFeed: NewsItem[];
  retired: boolean;
  retiredYear?: number;
  postCareerRole?: string;
  hallOfFame: boolean;
  legacyTier?: LegacyTier;
}

export type LegacyTier =
  | "never_stuck"
  | "role_player"
  | "solid_starter"
  | "good_player"
  | "occasional_allstar"
  | "superstar"
  | "historic_legend";

export type TeamMarketSize = "small" | "medium" | "large";

export type TeamTendency =
  | "rebuild"
  | "contender"
  | "play_in"
  | "tanking"
  | "win_now";

export type TeamCulture =
  | "development"
  | "defense"
  | "stars"
  | "instability"
  | "analytics";

export interface Team {
  id: string;
  name: string;
  city: string;
  conference: "East" | "West";
  division: string;
  marketSize: TeamMarketSize;
  fanPressure: number;
  winningHistory: number;
  patienceWithYouth: number;
  tendency: TeamTendency;
  capSpaceApprox: number;
  culture: TeamCulture;
  playStyle: string;
  tradeChance: number;
  reSignChance: number;
  injuryTolerance: number;
  dramaTolerance: number;
}

export interface College {
  id: string;
  name: string;
  nationalExposure: number;
  development: number;
  pressure: number;
  marchMadnessChance: number;
  starterChance: number;
  scoutRelations: number;
  offensiveSystem: string;
  defensiveSystem: string;
  nbaProductionHistory: number;
}

export interface MediaOutlet {
  id: string;
  name: string;
  tone: "analytical" | "sensational" | "balanced" | "insider";
}

export interface Journalist {
  id: string;
  name: string;
  outletId: string;
  specialty: "rumors" | "analysis" | "debate" | "rankings";
}

export interface Decision {
  id: string;
  label: string;
  description: string;
  availablePhases: CareerPhase[];
  effects: (player: Player) => Player;
}

export interface GameState {
  player: Player | null;
  teams: Team[];
  colleges: College[];
  year: number;
  history: NewsItem[];
}
