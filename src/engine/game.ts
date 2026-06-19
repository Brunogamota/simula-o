import {
  College,
  EventContext,
  GameEvent,
  NewsItem,
  NpcPersona,
  Player,
  SeasonPhase,
  Team,
  PHASE_LENGTH_WEEKS,
  PHASE_ORDER,
} from "@/types";
import { COLLEGES } from "@/data/colleges";
import { TEAMS } from "@/data/teams";
import { chance, weightedPick } from "@/lib/random";
import { simulateSeason, progressAttributes } from "./season";
import { generateDraftProfile, resolveDraftResult } from "./draft";
import { rookieScaleContract, calculateContractOffer } from "./contracts";
import {
  applyAnnualSalary,
  applySponsorshipIncome,
  maybeGenerateSponsorship,
  recalcNetWorth,
} from "./finance";
import {
  generateBreakingNews,
  generateDebateNews,
  generateDraftStockNews,
  generateLegacyNews,
  generatePodcastNews,
  generatePowerRankingNews,
  generateSeasonRecapNews,
  generateSocialBuzzNews,
  generateTradeRumorNews,
} from "./media";
import { calculateLegacyTier, checkHallOfFame } from "./legacy";
import { generateWeeklyEvents } from "./events";
import { generateTeamStaff } from "./npc";
import { computeNarrativeTag } from "./storylines";

function pickCollege(): College {
  const weighted = COLLEGES.map((c) => ({
    value: c,
    weight: c.scoutRelations * 0.5 + c.development * 0.3 + (100 - c.pressure) * 0.2,
  }));
  return weightedPick(weighted);
}

function pickFreeAgencyTeam(): Team {
  const weighted = TEAMS.map((t) => ({
    value: t,
    weight:
      t.capSpaceApprox * 0.4 +
      (t.tendency === "win_now" || t.tendency === "contender" ? 20 : 5) +
      t.reSignChance * 0.2,
  }));
  return weightedPick(weighted);
}

function checkAwards(player: Player): string[] {
  const season = player.seasons[player.seasons.length - 1];
  if (!season) return [];
  const awards: string[] = [];

  if (season.ppg > 25 && season.rating > 28 && chance(20)) awards.push("MVP");
  if (season.ppg > 18 && season.rating > 18 && chance(35)) awards.push("All-Star");
  if (season.rpg + season.bpg * 3 > 14 && chance(15)) awards.push("Defensive Player of the Year");
  if (player.age <= 22 && season.ppg > 15 && player.seasons.length <= 1 && chance(25))
    awards.push("Rookie of the Year");
  if (season.madePlayoffs && season.ppg > 22 && chance(10)) awards.push("Finals MVP");
  if (season.madePlayoffs && chance(8)) awards.push("NBA Champion");
  if (season.ppg > 20 && chance(20)) awards.push("All-NBA");

  return awards;
}

/**
 * Resolve a virada de ano de carreira (high school -> college -> draft -> NBA
 * -> aposentadoria). É chamado uma vez por ciclo, no fechamento da fase
 * "season_end", para consolidar tudo que aconteceu nas semanas anteriores.
 */
function finalizeYear(player: Player, year: number): { player: Player; news: NewsItem[] } {
  const news: NewsItem[] = [];

  if (player.retired) return { player, news };

  if (player.phase === "high_school") {
    let updated = progressAttributes(player);
    if (updated.age >= 18) {
      const college = pickCollege();
      updated = { ...updated, phase: "college", collegeId: college.id, collegeYears: 1 };
      news.push(
        generateBreakingNews(
          updated,
          `${updated.name} se compromete com ${college.name}`,
          `Em uma cobertura fictícia de recrutamento, ${updated.name} anuncia compromisso com o programa de ${college.name}.`,
          year
        )
      );
    }
    return { player: updated, news };
  }

  if (player.phase === "college") {
    const { player: afterSeason, season } = simulateSeason(player, undefined, year);
    let updated = progressAttributes(afterSeason);
    news.push(generateSeasonRecapNews(updated, season));

    if (updated.collegeYears >= 4 || chance(25 + updated.attributes.potential * 0.3)) {
      updated = { ...updated, phase: "draft" };
    }
    return { player: updated, news };
  }

  if (player.phase === "draft") {
    const profile = generateDraftProfile(player);
    const result = resolveDraftResult(profile);
    news.push(generateDraftStockNews(player, profile.mockRank, year));

    let updated: Player = {
      ...player,
      draftProfile: profile,
      draftYear: year,
      draftPick: result.pick,
    };

    if (result.pick === "undrafted") {
      updated = { ...updated, phase: "free_agent" };
      news.push(
        generateBreakingNews(
          updated,
          `${updated.name} não é selecionado no draft`,
          `Em simulação estilo cobertura de draft, ${updated.name} fica sem ser escolhido e buscará uma vaga via two-way ou free agency.`,
          year
        )
      );
    } else {
      const team = weightedPick(
        TEAMS.map((t) => ({
          value: t,
          weight: t.patienceWithYouth * 0.5 + t.capSpaceApprox * 0.5,
        }))
      );
      const contract = rookieScaleContract(result.pick, team.id, year);
      updated = {
        ...updated,
        phase: "nba",
        currentTeamId: team.id,
        contracts: [...updated.contracts, contract],
      };
      news.push(
        generateBreakingNews(
          updated,
          `${updated.name} é draftado pelo ${team.name} (pick #${result.pick})`,
          `Simulação estilo noite de draft: ${updated.name} é selecionado pelo ${team.name} na pick #${result.pick}.`,
          year
        )
      );
    }
    return { player: updated, news };
  }

  if (player.phase === "nba" || player.phase === "free_agent") {
    let updated = { ...player };

    if (updated.phase === "free_agent" || !updated.currentTeamId) {
      const team = pickFreeAgencyTeam();
      const contract = calculateContractOffer({ player: updated, team, year });
      updated = {
        ...updated,
        phase: "nba",
        currentTeamId: team.id,
        contracts: [...updated.contracts, contract],
      };
      news.push(
        generateBreakingNews(
          updated,
          `${updated.name} assina com ${team.name}`,
          `Simulação de free agency: ${updated.name} fecha acordo (${contract.type}) com o ${team.name}.`,
          year
        )
      );
    }

    const team = TEAMS.find((t) => t.id === updated.currentTeamId);
    const { player: afterSeason, season } = simulateSeason(updated, team, year);
    updated = afterSeason;

    const awards = checkAwards(updated);
    if (awards.length > 0) {
      updated.seasons[updated.seasons.length - 1].awards = awards;
      updated = { ...updated, awardsCareer: [...updated.awardsCareer, ...awards] };
    }
    news.push(generateSeasonRecapNews(updated, season));
    if (chance(30)) news.push(generateTradeRumorNews(updated, year));
    if (chance(20)) news.push(generateDebateNews(updated, "Status de superstar", year));

    const sponsorship = maybeGenerateSponsorship(updated, year);
    if (sponsorship) {
      updated = { ...updated, sponsorships: [...updated.sponsorships, sponsorship] };
    }

    const currentContract = updated.contracts[updated.contracts.length - 1];
    const grossSalary = currentContract?.annualSalary[year - currentContract.signedAtYear] ?? 1;
    let finance = applyAnnualSalary(updated.finance, grossSalary);
    finance = applySponsorshipIncome(finance, updated.sponsorships);
    finance = { ...finance, netWorth: recalcNetWorth(finance) };
    updated = { ...updated, finance };

    const contractEnded =
      !currentContract || year - currentContract.signedAtYear + 1 >= currentContract.years;
    if (contractEnded) {
      updated = { ...updated, phase: "free_agent" };
    }

    updated = progressAttributes(updated);
    updated = { ...updated, narrativeTag: computeNarrativeTag(updated) };

    if (updated.age >= 38 || (updated.age >= 33 && updated.marketValue < 15 && chance(40))) {
      updated = { ...updated, phase: "retired", retired: true, retiredYear: year };
      const tier = calculateLegacyTier(updated);
      const hof = checkHallOfFame(updated, tier);
      updated = { ...updated, legacyTier: tier, hallOfFame: hof };
      news.push(generateLegacyNews(updated, year));
      news.push(
        generateBreakingNews(
          updated,
          `${updated.name} anuncia aposentadoria`,
          `Após uma trajetória simulada na liga, ${updated.name} encerra a carreira como jogador.`,
          year
        )
      );
    }

    return { player: updated, news };
  }

  return { player, news };
}

export interface WeekState {
  player: Player;
  year: number;
  week: number;
  phase: SeasonPhase;
  coach?: NpcPersona;
  agent?: NpcPersona;
  owner?: NpcPersona;
}

export interface WeekResult extends WeekState {
  news: NewsItem[];
  events: GameEvent[];
}

function nextPhase(phase: SeasonPhase): SeasonPhase {
  const idx = PHASE_ORDER.indexOf(phase);
  return PHASE_ORDER[(idx + 1) % PHASE_ORDER.length];
}

/** Garante que o jogador tenha um técnico/dono vinculados ao time atual. */
export function ensureStaff(state: WeekState): WeekState {
  if (!state.player.currentTeamId) return state;
  if (state.coach && state.coach.teamId === state.player.currentTeamId) return state;

  const team = TEAMS.find((t) => t.id === state.player.currentTeamId);
  if (!team) return state;
  const { coach, owner } = generateTeamStaff(team);
  return { ...state, coach, owner };
}

/**
 * Avança exatamente uma semana de carreira. Gera eventos contextuais para a
 * semana corrente; ao final de uma fase, dispara a consolidação pesada
 * (temporada, draft, contrato, aposentadoria) apenas quando a fase
 * "season_end" é alcançada.
 */
export function advanceWeek(state: WeekState): WeekResult {
  const news: NewsItem[] = [];
  let player = state.player;

  if (player.retired) {
    return { ...state, news, events: [] };
  }

  const team = TEAMS.find((t) => t.id === player.currentTeamId);
  const ctx: EventContext = {
    team,
    coach: state.coach,
    agent: state.agent,
    owner: state.owner,
    year: state.year,
    week: state.week,
  };

  const events = generateWeeklyEvents(player, ctx, state.phase);

  if (player.phase === "nba" && (state.phase === "regular_season" || state.phase === "playoffs")) {
    if (chance(15)) {
      news.push(generatePowerRankingNews(player, Math.max(1, Math.round((100 - player.marketValue) / 4)), state.year));
    }
    if (chance(10)) {
      news.push(generatePodcastNews(player, "Próximos passos da carreira", state.year));
    }
    if (chance(20)) {
      news.push(
        generateSocialBuzzNews(
          player,
          player.morale > 60 ? `${player.name} está jogando muito essa semana` : `${player.name} precisa melhorar`,
          state.year
        )
      );
    }
  }

  let week = state.week + 1;
  let phase = state.phase;
  let year = state.year;

  if (week > PHASE_LENGTH_WEEKS[phase]) {
    week = 1;
    let advancedPhase = nextPhase(phase);

    if (phase === "regular_season" && advancedPhase === "playoffs") {
      const qualifies = team ? chance(35 + team.winningHistory * 0.35) : chance(40);
      if (!qualifies) advancedPhase = "season_end";
    }

    if (advancedPhase === "season_end") {
      const finalized = finalizeYear(player, year);
      player = finalized.player;
      news.push(...finalized.news);
    }

    if (phase === "season_end") {
      year += 1;
    }

    phase = advancedPhase;
  }

  return { player, year, week, phase, coach: state.coach, agent: state.agent, owner: state.owner, news, events };
}

export function getTeamById(id: string | null | undefined): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getCollegeById(id: string | null | undefined): College | undefined {
  return COLLEGES.find((c) => c.id === id);
}
