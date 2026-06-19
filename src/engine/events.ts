import {
  EventChoiceResult,
  EventContext,
  GameEvent,
  Player,
  SeasonPhase,
} from "@/types";
import { clamp, chance, pick, randInt } from "@/lib/random";
import { JOURNALISTS, OUTLETS } from "@/data/media";
import { SPONSOR_BRANDS } from "@/data/sponsors";
import { maybeGenerateInjury, applyInjuryEffects } from "./injuries";
import {
  generateBreakingNews,
  generateDebateNews,
  generateTradeRumorNews,
} from "./media";

function withAttrs(player: Player, delta: Partial<Player["attributes"]>): Player {
  const attributes = { ...player.attributes };
  for (const key in delta) {
    const k = key as keyof typeof attributes;
    attributes[k] = clamp(attributes[k] + (delta[k] ?? 0));
  }
  return { ...player, attributes };
}

function eventId(): string {
  return `event_${Date.now()}_${randInt(1000, 9999)}`;
}

type EventGenerator = {
  category: GameEvent["category"];
  weight: number;
  eligible: (player: Player, ctx: EventContext) => boolean;
  build: (player: Player, ctx: EventContext) => GameEvent;
};

const GENERATORS: EventGenerator[] = [
  {
    category: "coach",
    weight: 18,
    eligible: (p) => p.phase === "nba",
    build: (p, ctx) => {
      const coachName = ctx.coach?.name ?? "O técnico";
      return {
        id: eventId(),
        category: "coach",
        sourceName: coachName,
        title: `${coachName} chamou você para uma conversa`,
        description: `"Quero que você reduza seus arremessos e distribua mais a bola para o grupo. Confio em você para liderar isso."`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          {
            id: "agree",
            label: "Concordar",
            hint: "+ relação com o técnico, - ego",
            apply: (player): EventChoiceResult => ({
              player: withAttrs(player, { leadership: 2, ego: -2 }),
            }),
          },
          {
            id: "disagree",
            label: "Discordar educadamente",
            hint: "Sem grandes mudanças",
            apply: (player) => ({ player }),
          },
          {
            id: "demand",
            label: "Exigir mais protagonismo",
            hint: "+ ego, risco de atrito",
            apply: (player) => ({
              player: withAttrs(player, { ego: 4, popularity: -1 }),
              moraleDelta: -5,
            }),
          },
          {
            id: "request_trade",
            label: "Pedir troca",
            hint: "Grande consequência: pode acelerar uma saída",
            apply: (player) => ({
              player: withAttrs({ ...player, morale: clamp(player.morale + 5) }, { loyalty: -10 }),
              news: [
                generateBreakingNews(
                  player,
                  `${player.name} pede troca após atrito com o técnico`,
                  `Em simulação de bastidores, fontes apontam desgaste entre ${player.name} e a comissão técnica.`,
                  ctx.year
                ),
              ],
            }),
          },
        ],
      };
    },
  },
  {
    category: "sponsor",
    weight: 12,
    eligible: (p) => p.attributes.marketability > 30 && p.phase === "nba",
    build: (p, ctx) => {
      const brand = pick(SPONSOR_BRANDS.filter((b) => b.category === "shoes"));
      const valueMillions = randInt(2, 12);
      return {
        id: eventId(),
        category: "sponsor",
        sourceName: brand.name,
        title: `${brand.name} oferece um contrato de US$ ${valueMillions}M`,
        description: `Representantes da ${brand.name} apresentam uma proposta de patrocínio de calçados por temporada.`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          {
            id: "sign",
            label: "Assinar",
            apply: (player) => ({
              player: {
                ...player,
                sponsorships: [
                  ...player.sponsorships,
                  {
                    brand: brand.name,
                    category: "shoes",
                    annualValue: valueMillions,
                    startYear: ctx.year,
                    active: true,
                  },
                ],
              },
            }),
          },
          {
            id: "negotiate",
            label: "Negociar",
            hint: "Chance de aumentar o valor",
            apply: (player) => {
              const improved = chance(50);
              const finalValue = improved ? Math.round(valueMillions * 1.3) : valueMillions;
              return {
                player: {
                  ...player,
                  sponsorships: [
                    ...player.sponsorships,
                    {
                      brand: brand.name,
                      category: "shoes",
                      annualValue: finalValue,
                      startYear: ctx.year,
                      active: true,
                    },
                  ],
                },
              };
            },
          },
          {
            id: "decline",
            label: "Recusar",
            apply: (player) => ({ player: withAttrs(player, { ego: 1 }) }),
          },
        ],
      };
    },
  },
  {
    category: "media",
    weight: 16,
    eligible: (p) => p.phase === "nba" && p.seasons.length > 0,
    build: (p, ctx) => {
      const critic = pick(
        JOURNALISTS.filter((j) => j.specialty === "debate")
      );
      const outlet = OUTLETS.find((o) => o.id === critic.outletId)!;
      return {
        id: eventId(),
        category: "media",
        sourceName: critic.name,
        sourceOutlet: outlet.name,
        title: `${critic.name} criticou você ao vivo na ${outlet.name}`,
        description: `Em debate simulado, ${critic.name} questiona seu desempenho recente e sua postura dentro de quadra.`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          { id: "ignore", label: "Ignorar", apply: (player) => ({ player }) },
          {
            id: "respond",
            label: "Responder nas redes sociais",
            hint: "+ popularidade, risco de polêmica",
            apply: (player) => ({
              player: withAttrs(player, { popularity: 3, discipline: -2 }),
              news: [generateDebateNews(player, "Resposta nas redes sociais", ctx.year)],
            }),
          },
          {
            id: "interview",
            label: "Dar entrevista",
            hint: "Resposta madura, + relação com mídia",
            apply: (player) => ({
              player: withAttrs(player, { marketability: 2, discipline: 1 }),
            }),
          },
          {
            id: "joke",
            label: "Fazer piada sobre o assunto",
            hint: "+ popularidade",
            apply: (player) => ({ player: withAttrs(player, { popularity: 4, ego: 1 }) }),
          },
        ],
      };
    },
  },
  {
    category: "injury",
    weight: 10,
    eligible: (p) => p.phase === "nba",
    build: (p, ctx) => {
      const injury = maybeGenerateInjury(p) ?? {
        type: "Joelho",
        severity: "moderate" as const,
        gamesLost: 12,
        recurring: false,
      };
      return {
        id: eventId(),
        category: "injury",
        sourceName: "Departamento médico",
        title: `Diagnóstico: ${injury.type.toLowerCase()} (${injury.severity})`,
        description: `Exames apontam um problema físico que exige uma decisão imediata sobre como tratar a lesão.`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          {
            id: "surgery",
            label: "Operar imediatamente",
            hint: "Perde mais jogos, mas recupera totalmente",
            apply: (player) => ({
              player: applyInjuryEffects(
                { ...player, attributes: { ...player.attributes, durability: clamp(player.attributes.durability + 5) } },
                { ...injury, gamesLost: Math.round(injury.gamesLost * 1.4) }
              ),
            }),
          },
          {
            id: "play_hurt",
            label: "Jogar lesionado",
            hint: "Risco de agravar a lesão",
            apply: (player) => ({
              player: applyInjuryEffects(player, {
                ...injury,
                gamesLost: Math.round(injury.gamesLost * 0.3),
                severity: chance(35) ? "severe" : injury.severity,
              }),
            }),
          },
          {
            id: "second_opinion",
            label: "Buscar segunda opinião médica",
            hint: "Pode reduzir o tempo de recuperação",
            apply: (player) => ({
              player: applyInjuryEffects(player, {
                ...injury,
                gamesLost: Math.max(2, Math.round(injury.gamesLost * 0.8)),
              }),
            }),
          },
        ],
      };
    },
  },
  {
    category: "locker_room",
    weight: 10,
    eligible: (p) => p.phase === "nba",
    build: (p, ctx) => ({
      id: eventId(),
      category: "locker_room",
      sourceName: "Vestiário",
      title: "Um companheiro de equipe pediu troca abertamente",
      description: "O clima no vestiário ficou tenso após o pedido público de saída.",
      week: ctx.week,
      year: ctx.year,
      choices: [
        {
          id: "support",
          label: "Apoiar publicamente o companheiro",
          apply: (player) => ({ player: withAttrs(player, { leadership: 2, loyalty: 2 }) }),
        },
        {
          id: "stay_neutral",
          label: "Manter-se neutro",
          apply: (player) => ({ player }),
        },
        {
          id: "criticize",
          label: "Criticar a atitude do companheiro",
          apply: (player) => ({
            player: withAttrs(player, { popularity: 1, loyalty: -3 }),
          }),
        },
      ],
    }),
  },
  {
    category: "front_office",
    weight: 14,
    eligible: (p, ctx) => p.phase === "nba" && ctx.team !== undefined,
    build: (p, ctx) => {
      const team = ctx.team!;
      return {
        id: eventId(),
        category: "front_office",
        sourceName: "Diretoria",
        title: `${team.name} avalia o futuro de ${p.name} na franquia`,
        description: `A diretoria sinaliza intenção de conversar sobre os próximos passos do seu vínculo com o time.`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          {
            id: "commit",
            label: "Demonstrar comprometimento com o projeto",
            apply: (player) => ({ player: withAttrs(player, { loyalty: 4 }) }),
          },
          {
            id: "ask_assurances",
            label: "Pedir garantias sobre o papel no time",
            apply: (player) => ({ player: withAttrs(player, { ego: 2 }) }),
          },
          {
            id: "push_trade",
            label: "Sugerir abertamente que uma troca pode ser boa para os dois lados",
            apply: (player) => ({
              player: withAttrs({ ...player }, { loyalty: -6 }),
              news: [generateTradeRumorNews(player, ctx.year)],
            }),
          },
        ],
      };
    },
  },
  {
    category: "family",
    weight: 6,
    eligible: (p) => p.phase === "nba" || p.phase === "college",
    build: (p, ctx) => ({
      id: eventId(),
      category: "family",
      sourceName: "Família",
      title: "Um problema familiar está pedindo sua atenção",
      description: "Alguém próximo precisa de você fora das quadras, e isso pode afetar seu foco nas próximas semanas.",
      week: ctx.week,
      year: ctx.year,
      choices: [
        {
          id: "prioritize_family",
          label: "Priorizar a família",
          hint: "- foco no curto prazo, + bem-estar",
          apply: (player) => ({
            player: withAttrs({ ...player, morale: clamp(player.morale + 6) }, { discipline: -1 }),
          }),
        },
        {
          id: "prioritize_career",
          label: "Manter o foco total na carreira",
          hint: "- moral",
          apply: (player) => ({
            player: { ...player, morale: clamp(player.morale - 6) },
          }),
        },
      ],
    }),
  },
  {
    category: "agent",
    weight: 8,
    eligible: (p, ctx) => p.phase === "nba" && ctx.agent !== undefined,
    build: (p, ctx) => {
      const agent = ctx.agent!;
      return {
        id: eventId(),
        category: "agent",
        sourceName: agent.name,
        title: `${agent.name} enviou uma proposta de planejamento de carreira`,
        description: `Seu agente sugere uma estratégia para os próximos passos contratuais e de imagem.`,
        week: ctx.week,
        year: ctx.year,
        choices: [
          {
            id: "follow_advice",
            label: "Seguir o conselho do agente",
            apply: (player) => ({ player: withAttrs(player, { marketability: 2 }) }),
          },
          {
            id: "switch_agent",
            label: "Considerar trocar de agente",
            apply: (player) => ({ player: withAttrs(player, { marketability: -1 }) }),
          },
          {
            id: "ignore_agent",
            label: "Ignorar por agora",
            apply: (player) => ({ player }),
          },
        ],
      };
    },
  },
];

export function generateWeeklyEvents(
  player: Player,
  ctx: EventContext,
  phase: SeasonPhase
): GameEvent[] {
  if (player.retired) return [];

  const maxEvents = phase === "regular_season" || phase === "playoffs" ? 2 : 1;
  const pool = GENERATORS.filter((g) => g.eligible(player, ctx));
  const events: GameEvent[] = [];

  for (const gen of pool) {
    if (events.length >= maxEvents) break;
    if (chance(gen.weight)) {
      events.push(gen.build(player, ctx));
    }
  }

  return events;
}
