"use client";

import { GameEvent } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  coach: "COMISSÃO TÉCNICA",
  media: "MÍDIA",
  sponsor: "PATROCÍNIO",
  injury: "DEPARTAMENTO MÉDICO",
  locker_room: "VESTIÁRIO",
  agent: "AGENTE",
  family: "VIDA PESSOAL",
  front_office: "DIRETORIA",
  milestone: "MARCO DE CARREIRA",
  social: "REDES SOCIAIS",
};

export default function EventModal({
  event,
  onChoose,
  onClose,
}: {
  event: GameEvent;
  onChoose: (choiceId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-zinc-950 ring-1 ring-zinc-800 sm:rounded-2xl">
        <div className="bg-gradient-to-r from-orange-700 to-orange-500 px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100">
            {CATEGORY_LABEL[event.category] ?? "EVENTO"}
            {event.sourceOutlet ? ` · ${event.sourceOutlet}` : ""}
          </p>
          <p className="text-sm font-semibold text-white">{event.sourceName}</p>
        </div>

        <div className="px-5 py-5">
          <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{event.description}</p>

          <div className="mt-5 space-y-2">
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice.id)}
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-left ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:ring-orange-600"
              >
                <p className="text-sm font-semibold text-zinc-100">{choice.label}</p>
                {choice.hint && (
                  <p className="mt-0.5 text-xs text-zinc-500">{choice.hint}</p>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl py-2 text-xs font-medium text-zinc-500 hover:text-zinc-300"
          >
            Decidir mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
