# JSON Diff — Istruzioni per agenti

Applicazione web React per confrontare due documenti JSON con diff strutturale, JSON Patch, validazione schema e condivisione URL.

## Stack

| Area | Tecnologia |
|------|------------|
| Runtime / package manager | Bun 1.2 |
| UI | React 19, TypeScript 5.8, Vite 7 |
| Stili | Tailwind CSS 4, shadcn/ui (base-nova), @base-ui/react |
| i18n | Paraglide JS (EN base, IT) |
| Validazione schema | Ajv 8 |
| Lint / format | Biome 2 |

## Comandi

```bash
bun install              # dipendenze
bun run dev              # dev server → http://localhost:5173
bun run build            # paraglide:compile + tsc + vite build
bun run paraglide:compile  # rigenera src/paraglide/ da messages/
bun run lint             # biome check
bun run lint:fix         # biome check --write
bun run format           # biome format --write
```

Dopo ogni modifica a `messages/*.json`, eseguire `bun run paraglide:compile` (o `bun run build`).

## Struttura del progetto

```
json-diff/
├── AGENTS.md                 # questo file (istruzioni globali)
├── .agents/skills/           # skill installate via npx skills add
├── .cursor/
│   ├── mcp.json              # MCP shadcn
│   ├── rules/                # regole Cursor (.mdc)
│   └── skills/               # skill custom del progetto
├── messages/                 # traduzioni sorgente → vedi messages/AGENTS.md
├── project.inlang/           # config Paraglide (non modificare a mano se non necessario)
├── src/
│   ├── App.tsx               # orchestrazione stato, layout principale
│   ├── main.tsx              # bootstrap, tema, SEO
│   ├── index.css             # token CSS, temi, variabili Tailwind
│   ├── components/           # UI React → vedi src/components/AGENTS.md
│   ├── hooks/                # use-persisted-state, use-media-query
│   ├── lib/                  # logica pura → vedi src/lib/AGENTS.md
│   └── paraglide/            # GENERATO — non editare manualmente
```

## Architettura (dove aggiungere codice)

| Tipo di feature | Dove metterla |
|-----------------|---------------|
| Algoritmo diff / patch / formato | `src/lib/` |
| Nuovo pannello o viewer | `src/components/` + wiring in `App.tsx` |
| Testo UI tradotto | `messages/en.json` + `messages/it.json` → compile |
| Persistenza utente | `src/lib/storage.ts` (`STORAGE_KEYS`) + hook in `App.tsx` |
| Tema visivo | `src/lib/theme.ts` + `src/index.css` + chiavi in `messages/` |
| SEO | `src/lib/seo.ts` + messaggi `page_title`, `seo_keywords` |

`App.tsx` è il punto di integrazione: stato persistito, `useMemo` per diff/patch, composizione dei viewer. Mantienilo snello — estrai logica in `src/lib/` e UI in componenti dedicati.

## Checklist nuova feature

1. **Ambito** — La logica va in `lib/` o serve solo UI?
2. **Stato** — Serve persistenza? Aggiungi chiave in `STORAGE_KEYS` e validatore se è un enum.
3. **i18n** — Ogni stringa visibile all'utente va in `messages/` (EN + IT), poi `paraglide:compile`.
4. **Temi** — Usa variabili CSS esistenti in `index.css`; evita colori hardcoded.
5. **Accessibilità** — Label, `aria-*`, focus keyboard sui controlli nuovi.
6. **Qualità** — `bun run lint` e `bun run build` prima di considerare completato.

## Convenzioni codice

- Import alias `@/` → `src/` (vedi `tsconfig.json`).
- Componenti funzionali React; nessuna classe.
- Logica pura senza React in `src/lib/` (testabile, riusabile).
- Preferire estendere funzioni esistenti invece di duplicare.
- Evitare helper one-liner o astrazioni premature.
- Biome: doppie virgolette, semicolon, line width 88, indent 2 spazi.
- `src/components/ui/` = componenti shadcn generati; modifiche minime, rispettare override Biome.

```tsx
// ✅ Import messaggi
import { m } from "@/paraglide/messages.js";

// ✅ Utility classi
import { cn } from "@/lib/utils";

// ❌ Non importare da src/paraglide/messages/ singoli file — usa messages.js
// ❌ Non editare file in src/paraglide/
```

## Confini

### Sempre

- Mantieni scope minimo: solo ciò che la feature richiede.
- Aggiorna EN e IT insieme per ogni nuova chiave i18n.
- Usa `usePersistedState` / `usePersistedString` per preferenze utente.
- Rispetta Conventional Commits (`feat:`, `fix:`, `refactor:`, ecc.).

### Chiedi prima

- Nuove dipendenze npm.
- Modifiche breaking a formati URL di condivisione o chiavi `localStorage`.
- Refactor ampi di `App.tsx` o del motore diff.

### Mai

- Commit o push senza richiesta esplicita dell'utente.
- Segreti o credenziali nel repo.
- Modificare manualmente `src/paraglide/` (è output di compile).
- `git push --force` su main/master.

## Skill e MCP (progetto)

### Skill custom

| Skill | Percorso | Quando |
|-------|----------|--------|
| **shadcn-base-ui** | `.cursor/skills/shadcn-base-ui/SKILL.md` | Priorità UI: riusa `ui/` → `shadcn add` → Base UI |
| Regola Cursor | `.cursor/rules/shadcn-base-ui.mdc` | Auto su `src/components/**/*.tsx` |

### Skill installate (`.agents/skills/`)

| Skill | Comando install | Uso |
|-------|-----------------|-----|
| **shadcn** (ufficiale) | `npx skills add shadcn/ui@shadcn` | CLI, registry, `shadcn info`, composizione componenti |
| **paraglide-js** | `npx skills add zhuojg/agent-skills@paraglide-js` | i18n, compile, strategie locale |
| **vercel-react-best-practices** | `npx skills add vercel-labs/agent-skills@vercel-react-best-practices` | Pattern React (rerender, bundle, hooks) |

Aggiornare: `npx skills update` · Cercare altre: `npx skills find <query>` · Catalogo: https://skills.sh/

### MCP shadcn

Config in `.cursor/mcp.json`. Abilitare il server **shadcn** in **Cursor Settings → MCP**, poi riavviare Cursor se necessario.

Esempi prompt: *"aggiungi dialog e tooltip"*, *"cerca componenti nel registry"*, *"audita i componenti shadcn del progetto"*.

```bash
bunx shadcn@latest mcp init --client cursor   # rigenera config MCP
bunx shadcn info --json                         # contesto progetto per agenti
```

## Istruzioni per area

- [Logica e algoritmi](src/lib/AGENTS.md)
- [Componenti React e UI](src/components/AGENTS.md)
- [Internazionalizzazione](messages/AGENTS.md)
