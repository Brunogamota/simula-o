"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NATIONALITIES } from "@/data/nationalities";
import { useGameStore } from "@/store/useGameStore";
import {
  Hand,
  Personality,
  PlayStyle,
  Position,
  SocialBackground,
} from "@/types";

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];
const STYLES: { value: PlayStyle; label: string }[] = [
  { value: "scorer", label: "Scorer" },
  { value: "playmaker", label: "Playmaker" },
  { value: "defender", label: "Defender" },
  { value: "shooter", label: "Shooter" },
  { value: "athletic_wing", label: "Athletic Wing" },
  { value: "two_way", label: "Two-Way" },
  { value: "big_man", label: "Big Man" },
  { value: "stretch_big", label: "Stretch Big" },
];
const BACKGROUNDS: { value: SocialBackground; label: string }[] = [
  { value: "poor", label: "Origem humilde" },
  { value: "middle_class", label: "Classe média" },
  { value: "wealthy", label: "Família rica" },
];
const PERSONALITIES: { value: Personality; label: string }[] = [
  { value: "humble", label: "Humilde" },
  { value: "confident", label: "Confiante" },
  { value: "problematic", label: "Problemático" },
  { value: "leader", label: "Líder" },
  { value: "reserved", label: "Reservado" },
  { value: "media_friendly", label: "Midiático" },
];

export default function CreatePage() {
  const router = useRouter();
  const startNewCareer = useGameStore((s) => s.startNewCareer);

  const [name, setName] = useState("");
  const [nationality, setNationality] = useState(NATIONALITIES[0]);
  const [startAge, setStartAge] = useState(16);
  const [heightCm, setHeightCm] = useState(196);
  const [weightKg, setWeightKg] = useState(88);
  const [position, setPosition] = useState<Position>("SG");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("scorer");
  const [background, setBackground] = useState<SocialBackground>("middle_class");
  const [dominantHand, setDominantHand] = useState<Hand>("right");
  const [personality, setPersonality] = useState<Personality>("confident");
  const [potential, setPotential] = useState(60);
  const [injuryRisk, setInjuryRisk] = useState(30);
  const [workEthic, setWorkEthic] = useState(60);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startNewCareer({
      name: name.trim(),
      nationality,
      startAge,
      heightCm,
      weightKg,
      position,
      playStyle,
      background,
      dominantHand,
      personality,
      potential,
      injuryRisk,
      workEthic,
    });
    router.push("/career");
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold">Criação de personagem</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Defina o ponto de partida da sua carreira fictícia no basquete.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Field label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Nome do jogador"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nacionalidade">
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="input"
            >
              {NATIONALITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`Idade inicial: ${startAge}`}>
            <input
              type="range"
              min={15}
              max={18}
              value={startAge}
              onChange={(e) => setStartAge(Number(e.target.value))}
              className="w-full"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={`Altura: ${heightCm} cm`}>
            <input
              type="range"
              min={175}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full"
            />
          </Field>
          <Field label={`Peso: ${weightKg} kg`}>
            <input
              type="range"
              min={70}
              max={140}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full"
            />
          </Field>
        </div>

        <Field label="Posição">
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((p) => (
              <Chip key={p} active={position === p} onClick={() => setPosition(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Estilo de jogo">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip
                key={s.value}
                active={playStyle === s.value}
                onClick={() => setPlayStyle(s.value)}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Origem social">
          <div className="flex flex-wrap gap-2">
            {BACKGROUNDS.map((b) => (
              <Chip
                key={b.value}
                active={background === b.value}
                onClick={() => setBackground(b.value)}
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Mão dominante">
            <div className="flex gap-2">
              <Chip active={dominantHand === "right"} onClick={() => setDominantHand("right")}>
                Destro
              </Chip>
              <Chip active={dominantHand === "left"} onClick={() => setDominantHand("left")}>
                Canhoto
              </Chip>
            </div>
          </Field>
        </div>

        <Field label="Personalidade">
          <div className="flex flex-wrap gap-2">
            {PERSONALITIES.map((p) => (
              <Chip
                key={p.value}
                active={personality === p.value}
                onClick={() => setPersonality(p.value)}
              >
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label={`Potencial inicial: ${potential}`}>
          <input
            type="range"
            min={20}
            max={99}
            value={potential}
            onChange={(e) => setPotential(Number(e.target.value))}
            className="w-full"
          />
        </Field>
        <Field label={`Risco de lesão: ${injuryRisk}`}>
          <input
            type="range"
            min={5}
            max={80}
            value={injuryRisk}
            onChange={(e) => setInjuryRisk(Number(e.target.value))}
            className="w-full"
          />
        </Field>
        <Field label={`Ética de trabalho: ${workEthic}`}>
          <input
            type="range"
            min={10}
            max={99}
            value={workEthic}
            onChange={(e) => setWorkEthic(Number(e.target.value))}
            className="w-full"
          />
        </Field>

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-500"
        >
          Iniciar carreira
        </button>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #3f3f46;
          background: #18181b;
          color: #f4f4f5;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-orange-600 text-white"
          : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}
