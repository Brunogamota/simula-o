import { FinanceState, Player, Sponsorship } from "@/types";
import { SPONSOR_BRANDS } from "@/data/sponsors";
import { chance, clamp, randFloat, weightedPick } from "@/lib/random";

const TAX_RATE = 0.45;
const LIFESTYLE_BASE_SPEND_RATIO = 0.35;

export function applyAnnualSalary(finance: FinanceState, grossSalaryMillions: number): FinanceState {
  const taxes = grossSalaryMillions * TAX_RATE;
  const netSalary = grossSalaryMillions - taxes;
  const lifestyleSpend = netSalary * (LIFESTYLE_BASE_SPEND_RATIO + randFloat(-0.05, 0.1));
  const investable = netSalary - lifestyleSpend;
  const investmentReturn = finance.investments * 0.06;

  return {
    ...finance,
    netWorth:
      finance.netWorth + investable + investmentReturn - finance.investments * 0 + investmentReturn * 0,
    liquidCash: finance.liquidCash + investable * 0.4,
    totalEarnedSalary: finance.totalEarnedSalary + grossSalaryMillions,
    totalTaxesPaid: finance.totalTaxesPaid + taxes,
    totalSpent: finance.totalSpent + lifestyleSpend,
    investments: finance.investments + investable * 0.6 + investmentReturn,
  };
}

export function applySponsorshipIncome(finance: FinanceState, sponsorships: Sponsorship[]): FinanceState {
  const totalSponsorship = sponsorships
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.annualValue, 0);
  const taxes = totalSponsorship * TAX_RATE * 0.7;
  const net = totalSponsorship - taxes;

  return {
    ...finance,
    netWorth: finance.netWorth + net,
    liquidCash: finance.liquidCash + net * 0.5,
    totalEarnedSponsorships: finance.totalEarnedSponsorships + totalSponsorship,
    totalTaxesPaid: finance.totalTaxesPaid + taxes,
    investments: finance.investments + net * 0.5,
  };
}

export function recalcNetWorth(finance: FinanceState): number {
  return Math.round((finance.liquidCash + finance.investments) * 10) / 10;
}

/** Pode gerar um novo patrocínio com base em popularidade, mercado e desempenho. */
export function maybeGenerateSponsorship(player: Player, year: number): Sponsorship | null {
  const offerChance =
    player.attributes.marketability * 0.4 +
    player.attributes.popularity * 0.3 +
    player.marketValue * 0.3;

  if (!chance(clamp(offerChance * 0.5, 2, 60))) return null;

  const eligibleBrands =
    offerChance > 70
      ? SPONSOR_BRANDS
      : SPONSOR_BRANDS.filter((b) => b.tier !== "elite");

  const brand = weightedPick(
    eligibleBrands.map((b) => ({
      value: b,
      weight: b.tier === "elite" ? 1 : b.tier === "mid" ? 3 : 5,
    }))
  );

  const valueMillions =
    brand.tier === "elite"
      ? randFloat(3, 15)
      : brand.tier === "mid"
        ? randFloat(0.5, 3)
        : randFloat(0.1, 0.8);

  return {
    brand: brand.name,
    category: brand.category,
    annualValue: Math.round(valueMillions * 10) / 10,
    startYear: year,
    active: true,
  };
}
