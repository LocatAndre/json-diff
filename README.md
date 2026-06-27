# JSON Diff

Applicazione web per confrontare due documenti JSON e visualizzare le differenze in modo chiaro.

## Funzionalità

- Due editor affiancati con upload file, drag & drop, download e copia
- Validazione JSON in tempo reale
- Diff strutturale con percorsi (`user.settings.theme`, `roles[1]`, ecc.)
- Tre modalità di visualizzazione: affiancata, unificata e per percorso
- Confronto array per indice, per valore (senza ordine) o per chiave
- Esportazione JSON Patch (RFC 6902) con copia, download e applicazione a JSON A
- Validazione opzionale JSON Schema
- Opzioni di confronto: null come assente, numeri flessibili, profondità massima
- Ricerca/filtro nel diff per percorso o valore
- Diff testuale inline per stringhe modificate
- Condivisione via URL (con avviso privacy)
- Persistenza locale di editor, impostazioni e schema
- Internazionalizzazione (EN / IT) e 14 temi
- SEO dinamico e layout responsive

## Avvio

```bash
bun install
bun run dev
```

Apri `http://localhost:5173` nel browser.

## Build

```bash
bun run build
bun run preview
```

## Qualità del codice

```bash
bun run lint
bun run lint:fix
bun run format
```

I commit seguono [Conventional Commits](https://www.conventionalcommits.org/) e vengono validati da Commitlint tramite Husky.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Paraglide JS (i18n)
- Ajv (JSON Schema)
- Bun
- Biome
- Commitlint
