"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";
import { getCollegeById, getTeamById } from "@/engine/game";
import { LEGACY_LABELS } from "@/engine/legacy";
import { CareerPhase } from "@/types";

const PHASE_LABELS: Record<CareerPhase, string> = {
  high_school: "High School",
  college: "Universidade",
  draft: "Draft",
  nba: "NBA",
  free_agent: "Free Agency",
  retired: "Aposentado",
  post_career: "Pós-carreira",
};

const TABS = [
  "carreira",
  "estatisticas",
  "midia",
  "contratos",
  "financas",
  "legado",
  "decisoes",
] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  carreira: "Carreira",
  estatisticas: "Estatísticas",
  midia: "Mídia",
  contratos: "Contratos",
  financas: "Finanças",
  legado: "Legado",
  decisoes: "Decisões",
};

export default function CareerPage() {
  const router = useRouter();
  const { player, year, newsFeed, lastYearNews, hydrate, hydrated, advance, applyDecision, availableDecisions, resetGame } =
    useGameStore();
  const [tab, setTab] = useState<Tab>("carreira");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !player) router.push("/create");
  }, [hydrated, player, router]);

  useEffect(() => {
    if (lastYearNews.length > 0) setShowPopup(true);
  }, [lastYearNews]);

  if (!player) {
    return <main className="flex-1 p-8 text-center text-zinc-400">Carregando...</main>;
  }

  const team = getTeamById(player.currentTeamId);
  const college = getCollegeById(player.collegeId);
  const decisions = availableDecisions();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{player.name}</h1>
          <p className="text-sm text-zinc-400">
            {PHASE_LABELS[player.phase]} · {player.position} · {player.age} anos · {year}
            {team ? ` · ${team.name}` : ""}
            {college && player.phase === "college" ? ` · ${college.name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={advance}
            disabled={player.retired}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-40"
          >
            Avançar ano
          </button>
          <button
            onClick={() => {
              resetGame();
              router.push("/create");
            }}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Nova carreira
          </button>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      <section className="mt-6">
        {tab === "carreira" && <CareerTab />}
        {tab === "estatisticas" && <StatsTab />}
        {tab === "midia" && <MediaTab />}
        {tab === "contratos" && <ContractsTab />}
        {tab === "financas" && <FinanceTab />}
        {tab === "legado" && <LegacyTab />}
        {tab === "decisoes" && <DecisionsTab />}
      </section>

      {showPopup && lastYearNews.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto scrollbar-thin rounded-xl bg-zinc-900 p-5 shadow-2xl">
            <h2 className="text-lg font-bold">Novidades de {year - 1}</h2>
            <div className="mt-3 space-y-3">
              {lastYearNews.map((n) => (
                <div key={n.id} className="rounded-lg bg-zinc-800/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-orange-400">
                    {n.outlet}
                    {n.author ? ` · ${n.author}` : ""}
                  </p>
                  <p className="mt-1 font-semibold">{n.headline}</p>
                  <p className="mt-1 text-sm text-zinc-300">{n.body}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">{n.disclaimer}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 w-full rounded-lg bg-orange-600 py-2 font-semibold text-white hover:bg-orange-500"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );

  function CareerTab() {
    return (
      <div className="space-y-6">
        <Card title="Atributos">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(player!.attributes).map(([key, value]) => (
              <AttrBar key={key} label={key} value={value} />
            ))}
          </div>
        </Card>

        <Card title="Timeline da carreira">
          <ol className="space-y-2">
            {player!.seasons
              .slice()
              .reverse()
              .map((s, i) => (
                <li key={i} className="rounded-md bg-zinc-900/60 p-3 text-sm">
                  <span className="font-semibold">{s.year}</span> ({s.age} anos) —{" "}
                  {s.ppg} PPG / {s.rpg} RPG / {s.apg} APG · {s.teamRecord.wins}-
                  {s.teamRecord.losses}
                  {s.awards.length > 0 && (
                    <span className="ml-1 text-orange-400">· {s.awards.join(", ")}</span>
                  )}
                </li>
              ))}
            {player!.seasons.length === 0 && (
              <p className="text-sm text-zinc-500">Nenhuma temporada disputada ainda.</p>
            )}
          </ol>
        </Card>
      </div>
    );
  }

  function StatsTab() {
    const seasons = player!.seasons;
    const careerAvg = (key: "ppg" | "rpg" | "apg" | "spg" | "bpg") =>
      seasons.length
        ? Math.round((seasons.reduce((s, x) => s + x[key], 0) / seasons.length) * 10) / 10
        : 0;

    return (
      <div className="space-y-6">
        <Card title="Médias de carreira">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <Stat label="PPG" value={careerAvg("ppg")} />
            <Stat label="RPG" value={careerAvg("rpg")} />
            <Stat label="APG" value={careerAvg("apg")} />
            <Stat label="SPG" value={careerAvg("spg")} />
            <Stat label="BPG" value={careerAvg("bpg")} />
          </div>
        </Card>

        <Card title="Temporada por temporada">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="py-1 pr-3">Ano</th>
                  <th className="py-1 pr-3">Idade</th>
                  <th className="py-1 pr-3">GP</th>
                  <th className="py-1 pr-3">PPG</th>
                  <th className="py-1 pr-3">RPG</th>
                  <th className="py-1 pr-3">APG</th>
                  <th className="py-1 pr-3">FG%</th>
                  <th className="py-1 pr-3">3P%</th>
                  <th className="py-1 pr-3">Rating</th>
                </tr>
              </thead>
              <tbody>
                {seasons.map((s, i) => (
                  <tr key={i} className="border-t border-zinc-800">
                    <td className="py-1 pr-3">{s.year}</td>
                    <td className="py-1 pr-3">{s.age}</td>
                    <td className="py-1 pr-3">{s.gamesPlayed}</td>
                    <td className="py-1 pr-3">{s.ppg}</td>
                    <td className="py-1 pr-3">{s.rpg}</td>
                    <td className="py-1 pr-3">{s.apg}</td>
                    <td className="py-1 pr-3">{s.fgPct}%</td>
                    <td className="py-1 pr-3">{s.threePct}%</td>
                    <td className="py-1 pr-3">{s.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {seasons.length === 0 && (
              <p className="text-sm text-zinc-500">Sem estatísticas registradas.</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  function MediaTab() {
    return (
      <Card title="Feed de mídia (simulação fictícia)">
        <div className="space-y-3">
          {newsFeed.map((n) => (
            <div key={n.id} className="rounded-lg bg-zinc-900/60 p-3">
              <p className="text-xs uppercase tracking-wide text-orange-400">
                {n.outlet}
                {n.author ? ` · ${n.author}` : ""} · {n.year}
              </p>
              <p className="mt-1 font-semibold">{n.headline}</p>
              <p className="mt-1 text-sm text-zinc-300">{n.body}</p>
              <p className="mt-1 text-[10px] text-zinc-500">{n.disclaimer}</p>
            </div>
          ))}
          {newsFeed.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma notícia ainda.</p>
          )}
        </div>
      </Card>
    );
  }

  function ContractsTab() {
    return (
      <Card title="Contratos">
        <div className="space-y-3">
          {player!.contracts
            .slice()
            .reverse()
            .map((c, i) => {
              const t = getTeamById(c.teamId);
              return (
                <div key={i} className="rounded-lg bg-zinc-900/60 p-3 text-sm">
                  <p className="font-semibold">
                    {t?.name ?? c.teamId} · {c.type.replace("_", " ")}
                  </p>
                  <p className="text-zinc-400">
                    {c.years} ano(s) · US$ {c.totalValue}M total · assinado em {c.signedAtYear}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    Salários: {c.annualSalary.map((v) => `$${v}M`).join(" / ")}
                  </p>
                </div>
              );
            })}
          {player!.contracts.length === 0 && (
            <p className="text-sm text-zinc-500">Sem contratos firmados.</p>
          )}
        </div>
      </Card>
    );
  }

  function FinanceTab() {
    const f = player!.finance;
    return (
      <div className="space-y-6">
        <Card title="Patrimônio">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Patrimônio líquido" value={`$${Math.round(f.netWorth * 10) / 10}M`} />
            <Stat label="Caixa líquido" value={`$${Math.round(f.liquidCash * 10) / 10}M`} />
            <Stat label="Investimentos" value={`$${Math.round(f.investments * 10) / 10}M`} />
            <Stat label="Salários ganhos" value={`$${Math.round(f.totalEarnedSalary * 10) / 10}M`} />
            <Stat label="Patrocínios ganhos" value={`$${Math.round(f.totalEarnedSponsorships * 10) / 10}M`} />
            <Stat label="Impostos pagos" value={`$${Math.round(f.totalTaxesPaid * 10) / 10}M`} />
          </div>
        </Card>
        <Card title="Patrocínios">
          <div className="space-y-2">
            {player!.sponsorships.map((s, i) => (
              <div key={i} className="rounded-md bg-zinc-900/60 p-3 text-sm">
                {s.brand} — ${s.annualValue}M/ano ({s.category}) desde {s.startYear}
                {!s.active && " — encerrado"}
              </div>
            ))}
            {player!.sponsorships.length === 0 && (
              <p className="text-sm text-zinc-500">Nenhum patrocínio ainda.</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  function LegacyTab() {
    return (
      <Card title="Legado">
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-zinc-400">Status:</span>{" "}
            {player!.retired ? "Aposentado" : "Em atividade"}
          </p>
          {player!.legacyTier && (
            <p>
              <span className="text-zinc-400">Avaliação de legado:</span>{" "}
              <span className="font-semibold text-orange-400">
                {LEGACY_LABELS[player!.legacyTier]}
              </span>
            </p>
          )}
          <p>
            <span className="text-zinc-400">Hall da Fama (fictício):</span>{" "}
            {player!.hallOfFame ? "Sim" : "Ainda não"}
          </p>
          <p>
            <span className="text-zinc-400">Prêmios da carreira:</span>{" "}
            {player!.awardsCareer.length > 0 ? player!.awardsCareer.join(", ") : "Nenhum"}
          </p>
        </div>
      </Card>
    );
  }

  function DecisionsTab() {
    return (
      <Card title="Decisões disponíveis">
        <div className="grid gap-3 sm:grid-cols-2">
          {decisions.map((d) => (
            <button
              key={d.id}
              onClick={() => applyDecision(d.id)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-left hover:border-orange-600"
            >
              <p className="font-semibold">{d.label}</p>
              <p className="mt-1 text-xs text-zinc-400">{d.description}</p>
            </button>
          ))}
          {decisions.length === 0 && (
            <p className="text-sm text-zinc-500">Nenhuma decisão disponível nesta fase.</p>
          )}
        </div>
      </Card>
    );
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-zinc-900/60 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
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
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
