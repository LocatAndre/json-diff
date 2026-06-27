# Componenti shadcn installati

Aggiornare questo file dopo `bunx shadcn@latest add …`.

## In `src/components/ui/`

| File | Import | Uso tipico |
|------|--------|------------|
| `accordion.tsx` | `@/components/ui/accordion` | Sezioni espandibili (diff per path) |
| `alert.tsx` | `@/components/ui/alert` | Avvisi, errori |
| `badge.tsx` | `@/components/ui/badge` | Etichette stato, contatori |
| `button.tsx` | `@/components/ui/button` | Azioni |
| `card.tsx` | `@/components/ui/card` | Pannelli, sezioni |
| `checkbox.tsx` | `@/components/ui/checkbox` | Opzioni booleane |
| `collapsible.tsx` | `@/components/ui/collapsible` | Sezioni collassabili |
| `field.tsx` | `@/components/ui/field` | Label + controllo form |
| `input.tsx` | `@/components/ui/input` | Input testo |
| `item.tsx` | `@/components/ui/item` | Righe lista / menu item |
| `label.tsx` | `@/components/ui/label` | Etichette |
| `scroll-area.tsx` | `@/components/ui/scroll-area` | Contenuto scrollabile |
| `select.tsx` | `@/components/ui/select` | Dropdown selezione |
| `separator.tsx` | `@/components/ui/separator` | Divisori |
| `tabs.tsx` | `@/components/ui/tabs` | Navigazione a schede |
| `textarea.tsx` | `@/components/ui/textarea` | Testo multilinea |

## Feature components (composizione)

| File | Basato su |
|------|-----------|
| `select-field.tsx` | Field + Select |
| `code-block.tsx` | stili monospace |

## Comandi utili

```bash
# Aggiungere componente shadcn
bunx shadcn@latest add dialog

# Elencare componenti disponibili (interattivo)
bunx shadcn@latest add
```

## Componenti shadcn comuni non ancora installati

Valutare `shadcn add` prima di implementare a mano:

| Componente | Quando serve |
|------------|--------------|
| `dialog` | Modali, conferme |
| `popover` | Menu contestuali leggeri |
| `tooltip` | Suggerimenti hover |
| `switch` | Toggle on/off |
| `dropdown-menu` | Menu azioni |
| `sheet` | Pannello laterale mobile |
| `sonner` / `toast` | Notifiche temporanee |
| `slider` | Range numerico |
| `toggle` / `toggle-group` | Toolbar selezione |

Registry completo: https://ui.shadcn.com/docs/components

## Solo Base UI (se assente da shadcn)

Consultare https://base-ui.com/llms.txt e creare wrapper in `ui/`:

Alert Dialog, Autocomplete, Combobox, Context Menu, Menu, Menubar, Navigation Menu, Number Field, Popover, Progress, Radio, Slider, Switch, Toast, Toggle, Toolbar, Tooltip, …
