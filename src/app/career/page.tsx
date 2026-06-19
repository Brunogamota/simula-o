"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { getTeamById } from "@/engine/game";
import { LEGACY_LABELS } from "@/engine/legacy";
import { NARRATIVE_TAG_LABELS } from "@/types";
import EventModal from "@/components/EventModal";

const POPULARITY_STARS = (popularity: number) => Math.max(1, Math.min(5, Math.round(popularity / 20)));

const PHASE_LABELS: Record<string, string> = {
  offseason: "Offseason",
  preseason: "Pré-temporada",
  regular_season: "Temporada regular",
  playoffs: "Playoffs",
  season_end: "Fim de temporada",
};

const CAREER_PHASE_LABELS: Record<string, string> = {
  high_school: "High School",
  college: "Universidade",
  draft: "Draft",
  nba: "NBA",
  free_agent: "Free Agency",
  retired: "Aposentado",
  post_career: "Pós-carreira",
};

const CATEGORY_ICON: Record<string, string> = {
  coach: "🏀",
  media: "🎙️",
  sponsor: "💰",
  injury: "🩺",
  locker_room: "🚪",
  agent: "📋",
  family: "🏠",
  front_office: "🏢",
  milestone: "🏆",
  social: "📱",
};

type View = "hub" | "stats" | "media" | "contract" | "roster";

const TEAM_TENDENCY_LABELS: Record<string, string> = {
  rebuild: "Reconstrução",
  contender: "Candidato ao título",
  play_in: "Disputa de play-in",
  tanking: "Tanking",
  win_now: "Foco no presente",
};

export default function CareerPage() {
  const router = useRouter();
  const {
    player,
    year,
    week,
    phase,
    coach,
    newsFeed,
    pendingEvents,
    activeEvent,
    hydrate,
    hydrated,
    advance,
    openEvent,
    closeEvent,
    resolveEvent,
    resetGame,
    train,
    talkToCoach,
  } = useGameStore();

  const [view, setView] = useState<View>("hub");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !player) router.push("/create");
  }, [hydrated, player, router]);

  if (!player) {
    return <main className="flex-1 p-8 text-center text-zinc-400">Carregando...</main>;
  }

  const team = getTeamById(player.currentTeamId);
  const stars = POPULARITY_STARS(player.attributes.popularity);
  const netWorthLabel = `US$ ${Math.round(player.finance.netWorth * 10) / 10}M`;
  const currentContract = player.contracts[player.contracts.length - 1];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6">
      {/* Header de identidade */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/30 p-5 shadow-xl ring-1 ring-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{player.name}</h1>
            <p className="text-sm font-medium text-orange-400">
              {player.position} • {team ? `${team.name.toUpperCase()}` : CAREER_PHASE_LABELS[player.phase].toUpperCase()}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p>{year}</p>
            <p>{PHASE_LABELS[phase]} · semana {week}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <InfoBlock label="Idade" value={`${player.age} anos`} />
          <InfoBlock
            label="Popularidade"
            value={"★".repeat(stars) + "☆".repeat(5 - stars)}
          />
          <InfoBlock label="Patrimônio" value={netWorthLabel} />
          <InfoBlock
            label="Contrato"
            value={currentContract ? `${currentContract.years} anos` : "Sem contrato"}
          />
        </div>

        <div className="mt-3 rounded-lg bg-black/30 px-3 py-2 text-sm">
          <span className="text-zinc-400">Status: </span>
          <span className="font-semibold text-orange-300">
            {NARRATIVE_TAG_LABELS[player.narrativeTag]}
          </span>
        </div>
      </section>

      {/* Notícias do dia */}
      <SectionTitle>Notícias do dia</SectionTitle>
      <div className="space-y-2">
        {newsFeed.slice(0, 3).map((n) => (
          <div key={n.id} className="rounded-xl bg-zinc-900/70 p-3 ring-1 ring-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              {n.outlet}
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug">{n.headline}</p>
          </div>
        ))}
        {newsFeed.length === 0 && (
          <p className="text-sm text-zinc-500">Nenhuma notícia ainda. Avance a semana para gerar manchetes.</p>
        )}
      </div>

      {/* Eventos pendentes */}
      <SectionTitle>Eventos pendentes</SectionTitle>
      <div className="space-y-2">
        {pendingEvents.map((e) => (
          <button
            key={e.id}
            onClick={() => openEvent(e.id)}
            className="flex w-full items-center gap-3 rounded-xl bg-amber-950/40 p-3 text-left ring-1 ring-amber-700/40 hover:bg-amber-950/60"
          >
            <span className="text-xl">{CATEGORY_ICON[e.category] ?? "⚠️"}</span>
            <span className="flex-1 text-sm font-medium text-amber-100">{e.title}</span>
            <span className="text-amber-400">→</span>
          </button>
        ))}
        {pendingEvents.length === 0 && (
          <p className="text-sm text-zinc-500">Tudo resolvido. Pode avançar a semana.</p>
        )}
      </div>

      {/* Ações */}
      <SectionTitle>Ações</SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ActionButton label="Treinar" onClick={train} />
        <ActionButton label="Falar com técnico" onClick={talkToCoach} disabled={!coach} />
        <ActionButton label="Ver notícias" onClick={() => setView("media")} />
        <ActionButton label="Ver contrato" onClick={() => setView("contract")} />
        <ActionButton label="Ver elenco" onClick={() => setView("roster")} />
        <ActionButton label="Ver estatísticas" onClick={() => setView("stats")} />
        <ActionButton label="Nova carreira" onClick={() => { resetGame(); router.push("/create"); }} />
      </div>

      {view !== "hub" && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto scrollbar-thin rounded-t-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {view === "media" && "Notícias"}
                {view === "contract" && "Contrato"}
                {view === "stats" && "Estatísticas"}
                {view === "roster" && "Elenco"}
              </h2>
              <button onClick={() => setView("hub")} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            {view === "media" && (
              <div className="space-y-3">
                {newsFeed.map((n) => (
                  <div key={n.id} className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      {n.outlet}
                      {n.author ? ` · ${n.author}` : ""} · {n.year}
                    </p>
                    <p className="mt-1 font-semibold">{n.headline}</p>
                    <p className="mt-1 text-sm text-zinc-300">{n.body}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">{n.disclaimer}</p>
                  </div>
                ))}
                {newsFeed.length === 0 && <p className="text-sm text-zinc-500">Sem notícias ainda.</p>}
              </div>
            )}

            {view === "contract" && (
              <div className="space-y-3">
                {player.contracts
                  .slice()
                  .reverse()
                  .map((c, i) => {
                    const t = getTeamById(c.teamId);
                    return (
                      <div key={i} className="rounded-lg bg-zinc-900 p-3 text-sm">
                        <p className="font-semibold">
                          {t?.name ?? c.teamId} · {c.type.replace("_", " ")}
                        </p>
                        <p className="text-zinc-400">
                          {c.years} ano(s) · US$ {c.totalValue}M total · assinado em {c.signedAtYear}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Salários: {c.annualSalary.map((v) => `$${v}M`).join(" / ")}
                        </p>
                      </div>
                    );
                  })}
                {player.contracts.length === 0 && (
                  <p className="text-sm text-zinc-500">Sem contratos firmados.</p>
                )}

                <div className="mt-4 rounded-lg bg-zinc-900 p-3 text-sm">
                  <p className="font-semibold">Patrocínios</p>
                  {player.sponsorships.map((s, i) => (
                    <p key={i} className="mt-1 text-zinc-400">
                      {s.brand} — ${s.annualValue}M/ano ({s.category}) desde {s.startYear}
                      {!s.active && " — encerrado"}
                    </p>
                  ))}
                  {player.sponsorships.length === 0 && (
                    <p className="text-zinc-500">Nenhum patrocínio ainda.</p>
                  )}
                </div>
              </div>
            )}

            {view === "roster" && (
              <div className="space-y-3">
                {team ? (
                  <div className="rounded-lg bg-zinc-900 p-3 text-sm">
                    <p className="font-semibold">{team.name}</p>
                    <p className="mt-1 text-zinc-400">
                      {team.city} · {team.conference} · {team.division}
                    </p>
                    <p className="mt-1 text-zinc-400">
                      Estilo: {TEAM_TENDENCY_LABELS[team.tendency] ?? team.tendency} · {team.playStyle}
                    </p>
                    {coach && (
                      <p className="mt-2 text-zinc-300">
                        Técnico: <span className="font-medium">{coach.name}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Sem time atual.</p>
                )}
              </div>
            )}

            {view === "stats" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(player.attributes).map(([key, value]) => (
                    <AttrBar key={key} label={key} value={value} />
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-xs">
                    <thead className="text-zinc-400">
                      <tr>
                        <th className="py-1 pr-3">Ano</th>
                        <th className="py-1 pr-3">GP</th>
                        <th className="py-1 pr-3">PPG</th>
                        <th className="py-1 pr-3">RPG</th>
                        <th className="py-1 pr-3">APG</th>
                        <th className="py-1 pr-3">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.seasons.map((s, i) => (
                        <tr key={i} className="border-t border-zinc-800">
                          <td className="py-1 pr-3">{s.year}</td>
                          <td className="py-1 pr-3">{s.gamesPlayed}</td>
                          <td className="py-1 pr-3">{s.ppg}</td>
                          <td className="py-1 pr-3">{s.rpg}</td>
                          <td className="py-1 pr-3">{s.apg}</td>
                          <td className="py-1 pr-3">{s.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {player.seasons.length === 0 && (
                    <p className="mt-2 text-sm text-zinc-500">Sem temporadas registradas.</p>
                  )}
                </div>
                {player.legacyTier && (
                  <p className="text-sm">
                    <span className="text-zinc-400">Legado:</span>{" "}
                    <span className="font-semibold text-orange-400">{LEGACY_LABELS[player.legacyTier]}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra inferior fixa: avançar semana */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex-1 text-xs text-zinc-400">
            {pendingEvents.length > 0
              ? `${pendingEvents.length} evento(s) pendente(s) — resolva antes de avançar`
              : `${PHASE_LABELS[phase]} · semana ${week}`}
          </div>
          <button
            onClick={advance}
            disabled={player.retired || pendingEvents.length > 0}
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Avançar semana
          </button>
        </div>
      </div>

      {activeEvent && (
        <EventModal
          event={activeEvent}
          onChoose={(choiceId) => resolveEvent(activeEvent.id, choiceId)}
          onClose={closeEvent}
        />
      )}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-widest text-zinc-500">
      {children}
    </h2>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-sm font-bold text-zinc-100">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 ring-1 ring-zinc-800 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function AttrBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400">
        <span className="capitalize">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-orange-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
