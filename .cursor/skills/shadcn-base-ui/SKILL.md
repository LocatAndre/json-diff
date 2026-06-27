---
name: shadcn-base-ui
description: >-
  Preferisce componenti shadcn/ui già presenti in src/components/ui, installa
  quelli mancanti via CLI shadcn, oppure crea primitivi su @base-ui/react
  seguendo lo stile base-nova del progetto. Usa quando si creano o modificano
  componenti React, UI, form, dialog, menu, layout o si chiede un nuovo controllo
  interattivo.
---

# shadcn / Base UI — Componenti UI

Priorità obbligata per ogni nuovo controllo o pezzo di interfaccia.

## Decision tree

```
Serve UI?
  ├─ Esiste in src/components/ui/? → RIUSA / componi
  ├─ Esiste su shadcn (stile base-nova)? → bunx shadcn@latest add <nome>
  └─ Solo su Base UI? → Crea src/components/ui/<nome>.tsx su @base-ui/react
```

**Mai** introdurre altre UI library (MUI, Chakra, Ant, Radix “nudo” senza wrapper shadcn, Headless UI, ecc.).

## 1. Riusa shadcn esistenti

Prima di scrivere HTML/CSS custom, controlla [components.md](components.md) e componi da `@/components/ui/*`.

Pattern feature component (fuori da `ui/`):

```tsx
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages.js";

export function MyFeature({ className }: { className?: string }) {
  return (
    <Field className={cn("gap-2", className)}>
      <FieldLabel>{m.my_label()}</FieldLabel>
      <Button type="button" variant="outline">{m.btn_copy()}</Button>
    </Field>
  );
}
```

- Feature UI → `src/components/` (es. `SelectField`, `SchemaPanel`)
- Primitivi riusabili → `src/components/ui/`
- Icone → `lucide-react`
- Classi → `cn()` da `@/lib/utils`
- Token tema → classi semantiche (`bg-background`, `text-muted-foreground`, `border-input`, …), non colori hardcoded

## 2. Installa da shadcn se manca

Config progetto: `components.json` (style **base-nova**, alias `@/components/ui`).

```bash
bunx shadcn@latest add dialog
bunx shadcn@latest add popover tooltip switch
```

- Un componente per comando; verifica dipendenze transitive
- Dopo l’install, adatta solo se necessario — non riscrivere da zero
- Esegui `bun run lint:fix` sul file generato

Docs: https://ui.shadcn.com/docs/components

## 3. Crea su Base UI se shadcn non lo fornisce

Quando il componente non è nel registry shadcn, aggiungi un primitivo in `src/components/ui/` basato su `@base-ui/react`.

### Pattern obbligatorio (come `button.tsx`, `select.tsx`)

```tsx
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type * as React from "react";
import { cn } from "@/lib/utils";

function DialogContent({ className, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      className={cn(
        "rounded-lg border border-border bg-background p-4 shadow-lg outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { DialogContent /* + Root, Trigger, … */ };
```

Regole:

| Regola | Dettaglio |
|--------|-----------|
| Primitivo | `@base-ui/react/<componente>` |
| Stili | Tailwind + `cn()`, allineati ai componenti `ui/` esistenti |
| Slot | `data-slot="nome-parte"` su ogni sotto-parte |
| Varianti | `cva` + `VariantProps` se servono variant/size |
| Export | Named exports, API composable (Root, Trigger, Content, …) |
| A11y | Lasciare comportamento Base UI; non rimuovere attributi ARIA |

Riferimenti Base UI (leggere prima di implementare):

- Indice: https://base-ui.com/llms.txt
- Handbook: styling, composition, customization su base-ui.com/react/handbook/

## 4. Cosa evitare

```tsx
// ❌ div/button HTML al posto di primitivi esistenti
<button className="rounded bg-blue-500 px-4 py-2">Salva</button>

// ❌ libreria UI alternativa
import { Button } from "@mui/material";

// ❌ logica di business dentro ui/
// ui/ = solo presentazione e composizione Base UI + stili

// ✅
import { Button } from "@/components/ui/button";
<Button type="button" variant="default">{m.btn_save()}</Button>
```

## Checklist prima di completare

- [ ] Ho cercato in `src/components/ui/` e in shadcn registry
- [ ] Il feature component compone primitivi `ui/`, non duplica stili
- [ ] Stringhe utente via Paraglide (`m.*()`), non hardcoded
- [ ] `type="button"` su bottoni non-submit
- [ ] `bun run lint` passa sui file toccati

## Risorse progetto

- Inventario componenti installati: [components.md](components.md)
- Convenzioni componenti: `src/components/AGENTS.md`
- Config shadcn: `components.json`
