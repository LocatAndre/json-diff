# src/components — UI React

Componenti dell'interfaccia. `App.tsx` compone questi pezzi e gestisce lo stato globale.

## Layout e shell

| Componente | Ruolo |
|------------|------|
| `AppHeader.tsx` | Header con logo, selettore lingua/tema, menu impostazioni |
| `AppLogo.tsx` | Logo SVG |
| `LanguageSelector.tsx` | Cambio locale (Paraglide `setLocale`) |
| `ThemeSelector.tsx` | Selezione tema |
| `HeaderSettingsMenu.tsx` | Menu impostazioni header |

## Editor e diff

| Componente | Ruolo |
|------------|------|
| `JsonEditor.tsx` | Textarea JSON con toolbar (upload, drag&drop, copia) |
| `EditorToolbar.tsx` | Azioni editor (sample, format, clear) |
| `DiffViewer.tsx` | Vista diff per percorso (accordion) |
| `SplitDiffViewer.tsx` | Vista affiancata sinistra/destra |
| `UnifiedDiffViewer.tsx` | Vista unificata stile patch |
| `InlineTextDiff.tsx` | Evidenziazione caratteri su stringhe modificate |
| `SchemaPanel.tsx` | Input JSON Schema + risultati validazione |

## Utility UI

| Componente | Ruolo |
|------------|------|
| `select-field.tsx` | Select con label (pattern campo form) |
| `code-block.tsx` | Blocco codice monospace |
| `ui/*` | Primitivi shadcn (Button, Card, Tabs, …) |

## Convenzioni

### Struttura componente

```tsx
import { m } from "@/paraglide/messages.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MyPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function MyPanel({ value, onChange }: MyPanelProps) {
  return (
    <div className={cn("flex flex-col gap-2")}>
      <Button type="button">{m.btn_copy()}</Button>
    </div>
  );
}
```

- Export nominato per componenti feature (`export function X`).
- Props tipizzate con `interface`; evitare `any`.
- Testi utente solo via `m.chiave()` — mai stringhe letterali visibili.
- Icone da `lucide-react`.
- Classi Tailwind con `cn()` per composizione condizionale.

### Componenti `ui/`

- Generati da shadcn; stile **base-nova** con @base-ui/react.
- Biome ha override rilassati per a11y in `ui/**` — non stringere senza motivo.
- **Priorità UI**: seguire la skill **shadcn-base-ui** (`.cursor/skills/shadcn-base-ui/SKILL.md`):
  1. Riusa primitivi in `ui/`
  2. `bunx shadcn@latest add <component>` se manca nel registry
  3. Wrapper custom su `@base-ui/react` solo se shadcn non lo fornisce
- Inventario installato: `.cursor/skills/shadcn-base-ui/components.md`

### Stato

- Stato globale e persistenza: in `App.tsx` con `usePersistedState` / `usePersistedString`.
- Stato locale UI (es. copiato/idle, toggle pannello): `useState` nel componente.
- Logica di business: delegare a `src/lib/`, non duplicare nel componente.

### Responsive

- Usare `use-media-query` per layout mobile vs desktop.
- Seguire pattern esistenti in `App.tsx` (grid, tab, scroll-area).

## Aggiungere un nuovo componente feature

1. Creare `src/components/NomeComponente.tsx`.
2. Accettare dati già calcolati via props (diff entries, patch, errori parse).
3. Collegare in `App.tsx` con stato/handler esistenti.
4. Aggiungere chiavi i18n in `messages/` se serve testo nuovo.
5. Usare token CSS da `index.css` (`bg-background`, `text-muted-foreground`, ecc.).

## Accessibilità

- `type="button"` su bottoni non-submit.
- `aria-label` o label visibile per icone senza testo.
- `ScrollArea` per contenuti lunghi; evitare overflow nascosto senza scroll.
