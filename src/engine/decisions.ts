import { CareerPhase, Decision, Player } from "@/types";
import { clamp } from "@/lib/random";

function withAttrs(player: Player, delta: Partial<Player["attributes"]>): Player {
  const attributes = { ...player.attributes };
  for (const key in delta) {
    const k = key as keyof typeof attributes;
    attributes[k] = clamp(attributes[k] + (delta[k] ?? 0));
  }
  return { ...player, attributes };
}

export const DECISIONS: Decision[] = [
  {
    id: "stay_college",
    label: "Ficar mais um ano na universidade",
    description: "Adia o draft para ganhar desenvolvimento e exposição, mas envelhece um ano.",
    availablePhases: ["college"],
    effects: (p) => withAttrs({ ...p, collegeYears: p.collegeYears + 1 }, { basketballIQ: 3, popularity: 2 }),
  },
  {
    id: "declare_draft",
    label: "Declarar para o draft",
    description: "Entra no draft imediatamente, mesmo sem desenvolvimento adicional.",
    availablePhases: ["college"],
    effects: (p) => ({ ...p, phase: "draft" }),
  },
  {
    id: "focus_strength",
    label: "Focar em força física",
    description: "Treino intenso de força, com risco de fadiga.",
    availablePhases: ["high_school", "college", "nba", "free_agent"],
    effects: (p) => withAttrs(p, { strength: 4, athleticism: -1, health: -2 }),
  },
  {
    id: "focus_shooting",
    label: "Focar em arremesso",
    description: "Trabalho de verão dedicado ao arremesso.",
    availablePhases: ["high_school", "college", "nba", "free_agent"],
    effects: (p) => withAttrs(p, { shooting: 5, ballHandling: -1 }),
  },
  {
    id: "focus_defense",
    label: "Focar em defesa",
    description: "Prioriza fundamentos defensivos.",
    availablePhases: ["high_school", "college", "nba", "free_agent"],
    effects: (p) => withAttrs(p, { defense: 5, discipline: 2 }),
  },
  {
    id: "focus_playmaking",
    label: "Focar em criação",
    description: "Trabalha visão de jogo e handle.",
    availablePhases: ["high_school", "college", "nba", "free_agent"],
    effects: (p) => withAttrs(p, { passing: 4, ballHandling: 4 }),
  },
  {
    id: "play_injured",
    label: "Jogar lesionado",
    description: "Joga mesmo machucado para não perder espaço, arriscando agravar a lesão.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs({ ...p, morale: clamp(p.morale + 3) }, { health: -8, durability: -3 }),
  },
  {
    id: "request_trade",
    label: "Pedir troca",
    description: "Solicita publicamente uma troca para outro time.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs({ ...p, morale: clamp(p.morale + 5) }, { loyalty: -10, popularity: -3 }),
  },
  {
    id: "accept_smaller_role",
    label: "Aceitar papel menor em contender",
    description: "Reduz protagonismo em troca de chances de título.",
    availablePhases: ["nba", "free_agent"],
    effects: (p) => withAttrs(p, { ego: -5, leadership: 2 }),
  },
  {
    id: "sign_max_bad_team",
    label: "Assinar contrato máximo em time ruim",
    description: "Prioriza dinheiro acima de competitividade.",
    availablePhases: ["free_agent"],
    effects: (p) => withAttrs(p, { marketability: -3, popularity: -2 }),
  },
  {
    id: "take_less_for_title",
    label: "Aceitar menos dinheiro por título",
    description: "Sacrifica salário para jogar em time contender.",
    availablePhases: ["free_agent"],
    effects: (p) => withAttrs(p, { loyalty: 5, popularity: 4 }),
  },
  {
    id: "decline_extension",
    label: "Recusar extensão",
    description: "Aposta no próprio valor de mercado futuro.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { ego: 3 }),
  },
  {
    id: "switch_agent",
    label: "Trocar agente",
    description: "Busca melhor representação para negociações futuras.",
    availablePhases: ["nba", "free_agent"],
    effects: (p) => withAttrs(p, { marketability: 3 }),
  },
  {
    id: "controversial_interview",
    label: "Dar entrevista polêmica",
    description: "Gera repercussão na mídia, positiva ou negativa.",
    availablePhases: ["nba", "free_agent"],
    effects: (p) => withAttrs(p, { popularity: 5, discipline: -3 }),
  },
  {
    id: "defend_coach",
    label: "Defender técnico publicamente",
    description: "Mostra apoio institucional ao staff técnico.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { leadership: 3, loyalty: 3 }),
  },
  {
    id: "criticize_teammates",
    label: "Criticar companheiros",
    description: "Expõe atritos internos do vestiário.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { popularity: 2, loyalty: -6, leadership: -4 }),
  },
  {
    id: "secret_summer_training",
    label: "Fazer treino secreto no verão",
    description: "Trabalho intenso e discreto fora dos holofotes.",
    availablePhases: ["high_school", "college", "nba", "free_agent"],
    effects: (p) => withAttrs(p, { basketballIQ: 2, workEthic: 2, shooting: 2, finishing: 2 }),
  },
  {
    id: "load_management",
    label: "Entrar em load management",
    description: "Reduz desgaste poupando jogos ao longo da temporada.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { durability: 4, popularity: -2 }),
  },
  {
    id: "force_exit",
    label: "Forçar saída do time",
    description: "Pressiona abertamente por uma saída do elenco atual.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { loyalty: -12, popularity: -4 }),
  },
  {
    id: "become_locker_room_leader",
    label: "Virar líder do vestiário",
    description: "Assume responsabilidade de liderança no grupo.",
    availablePhases: ["nba"],
    effects: (p) => withAttrs(p, { leadership: 6, popularity: 3 }),
  },
];

export function decisionsForPhase(phase: CareerPhase): Decision[] {
  return DECISIONS.filter((d) => d.availablePhases.includes(phase));
}
