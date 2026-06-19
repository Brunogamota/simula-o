"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadGame } from "@/lib/storage";

export default function HomePage() {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detecta save existente apenas no client após montagem
    setHasSave(!!loadGame());
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Simula-<span className="text-orange-500">ção</span>
      </h1>
      <p className="mt-4 max-w-xl text-zinc-400">
        Um simulador narrativo e fictício de carreira de basquete: do high
        school à NBA, contratos, lesões, mídia e legado.
      </p>
      <p className="mt-2 max-w-xl text-xs text-zinc-500">
        Jogo de simulação não oficial. Não afiliado, licenciado ou endossado
        pela NBA, ESPN, universidades ou marcas citadas. Nomes reais usados
        apenas como referência narrativa fictícia.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {hasSave && (
          <Link
            href="/career"
            className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-500"
          >
            Continuar carreira
          </Link>
        )}
        <Link
          href="/create"
          className="rounded-lg border border-zinc-700 px-6 py-3 font-semibold text-zinc-100 hover:bg-zinc-900"
        >
          {hasSave ? "Nova carreira" : "Criar personagem"}
        </Link>
      </div>
    </main>
  );
}
