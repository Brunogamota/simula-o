import { JOURNALISTS, NARRATIVE_DISCLAIMER, OUTLETS } from "@/data/media";
import { NewsItem, Player, SeasonStats } from "@/types";
import { pick, randInt } from "@/lib/random";

function newsId(): string {
  return `news_${Date.now()}_${randInt(1000, 9999)}`;
}

function pickJournalist(specialty: (typeof JOURNALISTS)[number]["specialty"]) {
  const candidates = JOURNALISTS.filter((j) => j.specialty === specialty);
  return pick(candidates.length ? candidates : JOURNALISTS);
}

export function generateSeasonRecapNews(player: Player, season: SeasonStats): NewsItem {
  const journalist = pickJournalist("analysis");
  const outlet = OUTLETS.find((o) => o.id === journalist.outletId)!;

  const tone =
    season.ppg > 20
      ? "uma temporada de destaque individual"
      : season.gamesPlayed < 40
        ? "uma temporada marcada por desafios físicos"
        : "uma temporada consistente, sem grandes saltos";

  return {
    id: newsId(),
    year: season.year,
    outlet: outlet.name,
    author: journalist.name,
    headline: `Análise: ${player.name} fecha o ano com ${season.ppg} PPG, ${season.rpg} RPG e ${season.apg} APG`,
    body: `Em formato de análise estilo ${outlet.name}, especialistas comentam que ${player.name} viveu ${tone} nesta passagem pela liga. O time terminou com ${season.teamRecord.wins}-${season.teamRecord.losses}.`,
    category: "analysis",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateTradeRumorNews(player: Player, year: number): NewsItem {
  const journalist = pickJournalist("rumors");
  const outlet = OUTLETS.find((o) => o.id === journalist.outletId)!;

  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    author: journalist.name,
    headline: `Fontes indicam que times monitoram a situação de ${player.name}`,
    body: `Em uma matéria fictícia inspirada no estilo de furos de mercado, fontes ligadas à equipe sugerem que o nome de ${player.name} pode entrar em conversas de troca nas próximas semanas.`,
    category: "rumor",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateDraftStockNews(player: Player, mockRank: number, year: number): NewsItem {
  const journalist = pickJournalist("rankings");
  const outlet = OUTLETS.find((o) => o.id === journalist.outletId)!;

  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    author: journalist.name,
    headline: `Mock Draft simulado: ${player.name} aparece na posição #${mockRank}`,
    body: `Simulação estilo ${outlet.name}: analistas posicionam ${player.name} em torno do pick #${mockRank} no mock draft fictício desta janela, citando potencial e necessidades dos times.`,
    category: "mock_draft",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateDebateNews(player: Player, topic: string, year: number): NewsItem {
  const journalist = pickJournalist("debate");
  const outlet = OUTLETS.find((o) => o.id === journalist.outletId)!;

  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    author: journalist.name,
    headline: `Debate simulado: ${topic} envolvendo ${player.name}`,
    body: `Debate simulado com personalidades reais como referência (estilo ${outlet.name}): a discussão fictícia gira em torno de ${topic.toLowerCase()}, com opiniões divididas sobre o momento de carreira de ${player.name}.`,
    category: "debate",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateBreakingNews(player: Player, headline: string, body: string, year: number): NewsItem {
  const outlet = pick(OUTLETS);
  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    headline: `BREAKING: ${headline}`,
    body,
    category: "breaking",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generatePowerRankingNews(player: Player, rank: number, year: number): NewsItem {
  const outlet = OUTLETS.find((o) => o.id === "athletic") ?? OUTLETS[0];
  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    headline: `Power Rankings simulado: ${player.name} aparece na posição #${rank} da liga`,
    body: `Em uma classificação fictícia inspirada em power rankings de mídia esportiva, ${player.name} figura entre os destaques individuais da semana.`,
    category: "power_ranking",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generatePodcastNews(player: Player, topic: string, year: number): NewsItem {
  const journalist = pickJournalist("analysis");
  return {
    id: newsId(),
    year,
    outlet: "The Ringer (podcast)",
    author: journalist.name,
    headline: `Podcast simulado: o futuro de ${player.name} em discussão`,
    body: `Em um episódio fictício inspirado em formatos de podcast esportivo, comentaristas debatem ${topic.toLowerCase()} envolvendo ${player.name}.`,
    category: "podcast",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateSocialBuzzNews(player: Player, content: string, year: number): NewsItem {
  const outlet = pick(OUTLETS.filter((o) => o.id === "twitter" || o.id === "reddit"));
  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    headline: `Burburinho simulado nas redes sobre ${player.name}`,
    body: `Postagens fictícias inspiradas no tom de redes sociais: "${content}" — repercussão dividida entre torcedores simulados.`,
    category: "social_buzz",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}

export function generateLegacyNews(player: Player, year: number): NewsItem {
  const journalist = pickJournalist("analysis");
  const outlet = OUTLETS.find((o) => o.id === journalist.outletId)!;
  return {
    id: newsId(),
    year,
    outlet: outlet.name,
    author: journalist.name,
    headline: `Legado simulado: como ${player.name} é lembrado pela história fictícia da liga`,
    body: `Em uma narrativa de legado inspirada no tom de retrospectivas esportivas, comentaristas fictícios avaliam a trajetória de ${player.name} e seu lugar nas discussões históricas simuladas do jogo.`,
    category: "legacy",
    disclaimer: NARRATIVE_DISCLAIMER,
  };
}
