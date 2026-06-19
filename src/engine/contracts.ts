import { Contract, ContractType, Player, Team } from "@/types";
import { clamp } from "@/lib/random";

const SALARY_CAP_APPROX = 140; // milhões, valor de referência simulado

export function rookieScaleContract(pick: number | "undrafted", teamId: string, year: number): Contract {
  if (pick === "undrafted") {
    return {
      type: "two_way",
      teamId,
      years: 1,
      totalValue: 0.5,
      annualSalary: [0.5],
      playerOption: false,
      teamOption: true,
      noTradeClause: false,
      signedAtYear: year,
    };
  }
  const baseValue = clamp(12 - pick * 0.18, 1, 12);
  const years = pick <= 14 ? 4 : 3;
  const annualSalary = Array.from({ length: years }, (_, i) => Math.round((baseValue * (1 + i * 0.08)) * 10) / 10);
  return {
    type: "rookie_scale",
    teamId,
    years,
    totalValue: Math.round(annualSalary.reduce((a, b) => a + b, 0) * 10) / 10,
    annualSalary,
    playerOption: false,
    teamOption: pick > 14,
    noTradeClause: false,
    signedAtYear: year,
  };
}

export interface ContractOfferInput {
  player: Player;
  team: Team;
  year: number;
  desiredType?: ContractType;
}

/** Calcula uma oferta de contrato realista com base em produção, idade, saúde e mercado. */
export function calculateContractOffer(input: ContractOfferInput): Contract {
  const { player, team, year } = input;
  const lastSeason = player.seasons[player.seasons.length - 1];
  const production = lastSeason ? lastSeason.rating : 10;

  const ageFactor = player.age < 26 ? 1.1 : player.age > 33 ? 0.6 : 1;
  const healthFactor = player.attributes.health / 100;
  const marketFactor = clamp(player.marketValue, 5, 100) / 100;

  const maxSalary = SALARY_CAP_APPROX * 0.35;
  let annualValue =
    (production / 50) * maxSalary * 0.7 * ageFactor * healthFactor +
    marketFactor * maxSalary * 0.3;

  annualValue = clamp(annualValue, 1, maxSalary);

  let type: ContractType = "veteran";
  if (annualValue >= maxSalary * 0.85) type = player.awardsCareer.length > 3 ? "supermax" : "max";
  else if (annualValue >= maxSalary * 0.4) type = "extension";
  else if (annualValue >= maxSalary * 0.15) type = "mid_level";
  else type = "minimum";

  const years = type === "max" || type === "supermax" ? 5 : type === "extension" ? 4 : type === "minimum" ? 1 : 3;

  const annualSalary = Array.from({ length: years }, (_, i) =>
    Math.round(annualValue * (1 + i * 0.05) * 10) / 10
  );

  return {
    type,
    teamId: team.id,
    years,
    totalValue: Math.round(annualSalary.reduce((a, b) => a + b, 0) * 10) / 10,
    annualSalary,
    playerOption: years >= 4 && Math.random() < 0.3,
    teamOption: years <= 2 && Math.random() < 0.4,
    noTradeClause: type === "supermax" && team.fanPressure > 70,
    signedAtYear: year,
  };
}
