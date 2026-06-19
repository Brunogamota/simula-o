import { NpcPersona, NpcRole, NpcTemperament, Team } from "@/types";
import { pick, randInt, weightedPick } from "@/lib/random";

const COACH_FIRST = ["Mike", "Steve", "Erik", "Tyronn", "Doc", "Nick", "Quin", "Monty", "Chauncey", "J.B."];
const COACH_LAST = ["Reynolds", "Carter", "Holloway", "Donovan", "Brooks", "Sloan", "Pierce", "Madsen", "Hart", "Vance"];
const OWNER_FIRST = ["Robert", "Marc", "Steve", "Joe", "Glen", "Tilman", "Vivek", "Wyc", "Herb", "Jeanie"];
const OWNER_LAST = ["Caldwell", "Whitfield", "Marsh", "Okafor", "Bennington", "Russo", "Delgado", "Stern", "Halloway"];
const AGENT_FIRST = ["Rich", "Klutch", "Leon", "Dana", "Aaron", "Jeff", "Bernie", "Wendy", "Marcus", "Tony"];
const AGENT_LAST = ["Paul", "Goodwin", "Rose", "Mills", "Lieberman", "Schwartz", "Klein", "Ferreira", "Okonkwo"];

const TEMPERAMENTS: { value: NpcTemperament; weight: number }[] = [
  { value: "calm", weight: 25 },
  { value: "volatile", weight: 20 },
  { value: "demanding", weight: 25 },
  { value: "supportive", weight: 20 },
  { value: "calculating", weight: 10 },
];

function buildName(first: string[], last: string[]): string {
  return `${pick(first)} ${pick(last)}`;
}

export function generatePersona(role: NpcRole, teamId?: string): NpcPersona {
  const namePools: Record<string, [string[], string[]]> = {
    coach: [COACH_FIRST, COACH_LAST],
    owner: [OWNER_FIRST, OWNER_LAST],
    agent: [AGENT_FIRST, AGENT_LAST],
  };
  const [first, last] = namePools[role] ?? [COACH_FIRST, COACH_LAST];

  return {
    id: `${role}_${Date.now()}_${randInt(1000, 9999)}`,
    name: buildName(first, last),
    role,
    teamId,
    strictness: randInt(20, 90),
    patience: randInt(15, 90),
    loyalty: randInt(20, 90),
    temperament: weightedPick(TEMPERAMENTS),
  };
}

export function generateTeamStaff(team: Team): { coach: NpcPersona; owner: NpcPersona } {
  const coach = generatePersona("coach", team.id);
  const owner = generatePersona("owner", team.id);

  if (team.patienceWithYouth > 60) coach.patience += 15;
  if (team.dramaTolerance < 30) owner.strictness += 15;
  if (team.culture === "instability") owner.loyalty -= 15;

  return { coach, owner };
}
