# Simula-ção

Simulador narrativo e fictício de carreira de basquete: high school,
universidade, draft, NBA, contratos, lesões, mídia, finanças e legado.

> **Aviso:** este é um projeto de simulação **não oficial**, sem qualquer
> afiliação, licença ou endosso da NBA, ESPN, universidades ou demais marcas
> citadas. Nomes reais de times, universidades, veículos de mídia e
> jornalistas são usados **apenas como referência narrativa** dentro de
> textos fictícios gerados pela engine do jogo (notícias, mock drafts,
> debates simulados). Nenhuma citação real é atribuída a essas pessoas; todo
> conteúdo de mídia inclui um aviso de que é uma simulação fictícia. Não são
> usados logos, imagens ou assets oficiais de nenhuma marca.

## Stack

- Next.js (App Router) + TypeScript
- TailwindCSS v4
- Zustand para estado do jogo
- `localStorage` para salvar progresso (sem backend)

## Estrutura

```
src/
  types/        Tipos centrais (Player, Team, College, Contract, etc.)
  data/         Bases de dados editáveis (times, universidades, mídia, marcas)
  engine/       Lógica pura da simulação (sem dependência de UI)
    player.ts        Criação de personagem
    season.ts        Simulação de temporada e evolução de atributos
    draft.ts         Mock draft, combine, resultado do draft
    contracts.ts     Cálculo de ofertas de contrato
    finance.ts       Patrimônio, impostos, patrocínios
    injuries.ts      Geração e efeito de lesões
    media.ts         Geração de notícias fictícias estilo mídia esportiva
    decisions.ts     Catálogo de decisões de carreira e seus efeitos
    legacy.ts        Cálculo do tier de legado final (distribuição realista)
    game.ts          Orquestrador: avança um ano de carreira
  store/        Estado global (Zustand) + persistência em localStorage
  app/          Páginas (landing, criação de personagem, tela de carreira)
```

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Próximos passos (arquitetura já preparada para expandir)

- Negociação de troca interativa entre times
- Tela dedicada de free agency com múltiplas propostas
- Playoffs simulados jogo a jogo
- Pós-carreira mais detalhada (técnico, comentarista, dono minoritário)
- Mais universidades, times históricos e eventos de mídia
