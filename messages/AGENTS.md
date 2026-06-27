# messages — Internazionalizzazione

Traduzioni sorgente per [Paraglide JS](https://paraglidejs.com). Locale base: **en**. Locale aggiuntivo: **it**.

## File

| File | Locale |
|------|--------|
| `en.json` | Inglese (base) — definisce tutte le chiavi |
| `it.json` | Italiano — deve avere le stesse chiavi di `en.json` |

Config progetto: `project.inlang/settings.json`  
Output compilato: `src/paraglide/` (**non editare**)

## Workflow nuova stringa

1. Aggiungi la chiave in `messages/en.json` con valore inglese.
2. Aggiungi la **stessa chiave** in `messages/it.json` con traduzione italiana.
3. Esegui compile:

```bash
bun run paraglide:compile
```

4. Usa nel codice:

```ts
import { m } from "@/paraglide/messages.js";

m.my_new_key();                    // stringa semplice
m.greeting({ name: "Ada" });       // con parametri (se definiti nel JSON)
```

Paraglide genera `m.my_new_key` come funzione tree-shakeable con autocomplete TypeScript.

## Convenzioni naming

| Prefisso | Uso | Esempio |
|----------|-----|---------|
| `btn_` | Pulsanti | `btn_copy`, `btn_clear` |
| `label_` / `*_label` | Etichette form | `language_label` |
| `theme_` | Nomi temi | `theme_ocean` |
| `error_` / `*_error` | Errori | `copy_error` |
| `seo_` | Meta SEO | `seo_keywords` |
| `page_` / `app_` | Titoli e descrizioni app | `app_title` |

- Chiavi in `snake_case`.
- Niente stringhe duplicate con significati diversi — una chiave per concetto.
- Per enum con molte label (temi, formati), aggiungi chiavi in blocco e mappa in `src/lib/*Messages.ts`.

## Messaggi con parametri

Formato message-format inlang (plugin in `project.inlang`):

```json
{
  "changes_count": "{count} changes"
}
```

```ts
m.changes_count({ count: String(n) });
```

Consulta [documentazione Paraglide](https://paraglidejs.com) per plurali e markup ricco se necessario.

## Locale runtime

Strategia compile: `localStorage` → `cookie` → `baseLocale`.

- Cambio lingua: `LanguageSelector.tsx` chiama `setLocale` da `@/paraglide/runtime.js`.
- SEO: `src/lib/seo.ts` aggiorna `<title>` e meta da messaggi correnti.

## Errori comuni

| Problema | Soluzione |
|----------|-----------|
| `m.foo is not a function` | Manca compile dopo edit JSON |
| TS error su chiave messaggio | Chiave solo in un locale — allinea en + it |
| Stringa non si aggiorna in UI | Import da `messages.js`, non da file in `paraglide/messages/` |
