# KodiLedger design

KodiLedger uses a dark, high-contrast “Obsidian Ledger” interface for property and rental finance workflows. The visual system is defined in `src/app/globals.css`; this document describes the current frontend conventions and the intent behind them.

## Visual direction

- **Surfaces:** Near-black page background, charcoal navigation, and progressively lighter raised panels and controls. Use thin, low-contrast borders to separate surfaces instead of heavy outlines.
- **Accent:** Emerald is the primary action and active-navigation color. Cyan is available for secondary informational emphasis; amber and coral communicate caution and errors.
- **Typography:** Hanken Grotesk (with system sans-serif fallbacks) for interface text; JetBrains Mono (with system monospace fallbacks) for code-like values. Use tabular numerals for amounts and other numeric data.
- **Shape and depth:** Moderate rounded corners (`--radius-md`, `--radius-lg`) and restrained panel shadows. Keep the interface compact and data-oriented.
- **Color meaning:** Do not communicate status by color alone. Pair status colors with visible text, as in the status badges.

## Layout

On wide screens, the authenticated shell uses a fixed-width left sidebar and a flexible content column. The sidebar holds the KodiLedger identity, role-aware primary navigation, role badge, and sign-out action. Main content is centered within a maximum width and uses consistent page padding.

At widths up to 800px, navigation moves to a sticky top bar and a fixed bottom navigation row. Main content padding tightens, key-value details stack vertically, and tables become horizontally readable labeled rows. Keep controls touch-friendly, with a minimum target height of 2.75rem.

## Building blocks

- **Page header:** Page title and short context, with a related primary action aligned alongside when space allows. Allow the header to wrap on narrow screens.
- **Panels and cards:** Use `.panel` for grouped content, `.panel-empty` for empty results, `.panel-error` for failures, and `.panel-amber` for cautionary content. Unavailable information should look subdued and must not imply fabricated values.
- **Tables:** Use `.table-wrap` to contain overflow and `.table` for consistent row spacing. On small screens, expose each cell’s label through `data-label` so its meaning remains clear when the header is visually hidden.
- **Forms:** Stack fields vertically, keep forms to a readable width, associate labels and help text with controls, and show field-specific validation close to the input. Use `.btn-primary` for the main action; use standard or ghost buttons for secondary actions.
- **Status:** Use the shared badge styles for payment and unit states. Paid is emerald, partial is amber, overdue is coral, and vacant or neutral is gray.
- **Data states:** Loading, empty, error, and unavailable states should be explicit. Do not present missing backend metrics as zero or invent values to fill visual space.
- **Financial data:** Preserve decimal-safe values and format them consistently. Make currency and dates understandable in context; avoid relying on raw identifiers as the primary label.

## Interaction and accessibility

- Keep keyboard focus visible with the shared `:focus-visible` treatment.
- Provide a skip-to-content link and a focusable main region.
- Use semantic headings, navigation landmarks, real buttons for actions, and links for navigation.
- Mark the current navigation destination with `aria-current="page"`.
- Keep error, success, and validation messages textual and associated with the relevant action or field.
- Honor `prefers-reduced-motion`; avoid adding motion that is required to understand state changes.
- Preserve legibility and contrast when introducing new colors or states; use the existing theme tokens rather than hard-coded one-off colors where possible.

## Design tokens

The source of truth is the `:root` block in `src/app/globals.css`. Key token groups include:

| Purpose | Tokens |
| --- | --- |
| Surfaces | `--surface-base`, `--surface`, `--surface-raised`, `--surface-elevated`, `--surface-bright` |
| Brand and status | `--emerald`, `--emerald-light`, `--emerald-muted`, `--cyan`, `--amber`, `--amber-muted`, `--coral`, `--coral-muted` |
| Text and borders | `--text`, `--text-2`, `--text-3`, `--border`, `--border-strong` |
| Shape and layout | `--radius-md`, `--radius-lg`, `--nav-h` |
| Type | `--font-sans`, `--font-mono` |

## Product constraints

The interface should only suggest actions supported by the available backend routes and the signed-in user’s role. Keep financial workflows explicit and reviewable, especially when assigning an unassigned payment. Do not add dashboard KPIs, automated match-confidence claims, offline financial-data caching, or unsupported editing flows without corresponding product and backend support.
