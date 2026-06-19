export interface SponsorBrand {
  id: string;
  name: string;
  category: "shoes" | "apparel" | "drink" | "tech" | "other";
  tier: "elite" | "mid" | "entry";
}

// Marcas reais usadas apenas como referência narrativa. Sem logos/assets oficiais.
export const SPONSOR_BRANDS: SponsorBrand[] = [
  { id: "nike", name: "Nike", category: "shoes", tier: "elite" },
  { id: "adidas", name: "Adidas", category: "shoes", tier: "elite" },
  { id: "jordan_brand", name: "Jordan Brand", category: "shoes", tier: "elite" },
  { id: "puma", name: "Puma", category: "shoes", tier: "mid" },
  { id: "under_armour", name: "Under Armour", category: "shoes", tier: "mid" },
  { id: "new_balance", name: "New Balance", category: "shoes", tier: "mid" },
  { id: "gatorade", name: "Gatorade", category: "drink", tier: "elite" },
  { id: "beats", name: "Beats by Dre", category: "tech", tier: "mid" },
  { id: "bodyarmor", name: "BodyArmor", category: "drink", tier: "mid" },
  { id: "state_farm", name: "State Farm", category: "other", tier: "elite" },
  { id: "google", name: "Google", category: "tech", tier: "elite" },
  { id: "apple", name: "Apple", category: "tech", tier: "elite" },
  { id: "pepsi", name: "Pepsi", category: "drink", tier: "mid" },
  { id: "coca_cola", name: "Coca-Cola", category: "drink", tier: "mid" },
];
