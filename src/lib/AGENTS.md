# src/lib — Logica di dominio

Moduli TypeScript puri: nessun JSX, nessun hook React. Qui vive il motore diff, la formattazione, la persistenza e le utility.

## Moduli principali

| File | Responsabilità |
|------|----------------|
| `jsonDiff.ts` | Parse JSON, diff strutturale, `DiffEntry`, modalità array, filtro ricerca |
| `jsonFormat.ts` | `FormatMode`, normalizzazione per confronto, `formatToString` |
| `jsonPatch.ts` | Generazione/applicazione JSON Patch (RFC 6902) |
| `splitDiff.ts` | Trasformazione diff per vista affiancata |
| `textDiff.ts` | Diff testuale inline su stringhe modificate |
| `schemaValidate.ts` | Validazione JSON Schema con Ajv |
| `shareUrl.ts` | Serializzazione/deserializzazione stato in query URL |
| `storage.ts` | Chiavi `localStorage`, tipi `DisplayMode`/`ViewMode`, validatori enum |
| `fileUtils.ts` | Download testo, operazioni file |
| `theme.ts` | ID temi, gruppi, `initTheme`, persistenza tema |
| `themeMessages.ts` | Mapping `ThemeId` → messaggi Paraglide |
| `formatMessages.ts` | Label modalità formato |
| `arrayMessages.ts` | Label modalità confronto array |
| `parseErrorMessages.ts` | Messaggi errore parse JSON |
| `seo.ts` | Meta tag documento da messaggi i18n |
| `utils.ts` | `cn()` (clsx + tailwind-merge) |

## Tipi centrali

```ts
// jsonDiff.ts
type DiffType = "added" | "removed" | "changed" | "unchanged";
type ArrayCompareMode = "by-index" | "by-value" | "by-key";

interface DiffEntry {
  path: string;           // es. "user.settings.theme", "roles[1]"
  type: DiffType;
  left?: unknown;
  right?: unknown;
}
```

## Aggiungere opzioni al motore diff

1. Estendi `DiffOptions` in `jsonDiff.ts`.
2. Se l'opzione va persistita, aggiungila a `PersistedDiffOptions` in `storage.ts` e al default in `DEFAULT_DIFF_OPTIONS`.
3. Collega lo stato in `App.tsx` dentro `diffEngineOptions` (useMemo).
4. Esporre il controllo UI nel pannello opzioni appropriato.

## Aggiungere una modalità di visualizzazione

1. Estendi il tipo `DisplayMode` in `storage.ts` + `isValidDisplayMode`.
2. Implementa il viewer in `src/components/` (vedi `SplitDiffViewer`, `UnifiedDiffViewer`, `DiffViewer`).
3. Aggiungi tab/trigger in `App.tsx`.
4. Aggiorna `shareUrl.ts` se lo stato va condiviso via URL.

## Regole

- Funzioni pure dove possibile; side effect solo in `storage`, `shareUrl`, `seo`, `theme`.
- Non importare da `@/components/` o React.
- I messaggi utente passano da helper `*Messages.ts` che chiamano `m.*()` — non hardcodare stringhe UI qui.
- Per nuovi enum con label UI, crea un file `*Messages.ts` seguendo `themeMessages.ts` / `formatMessages.ts`.

## Test manuali utili

Dopo modifiche al diff engine, verificare in UI:

- Oggetti annidati, array vuoti, tipi misti
- Modalità array: by-index, by-value, by-key
- Opzioni: `treatNullAsMissing`, `numericTolerance`, `maxDepth`
- JSON Patch generato e applicato su JSON sinistro
