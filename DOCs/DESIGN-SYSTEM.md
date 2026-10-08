# KodiLedger Design System

KodiLedger uses the **Obsidian Ledger** visual system: a dark, calm, high-contrast interface for rental operations and financial records. This document describes the current frontend system and rules for extending it. The source of truth for implemented values is `src/app/globals.css`.

## Design principles

- **Make records easy to scan.** Use clear hierarchy, compact layouts, aligned values, and consistent labels.
- **Keep financial actions deliberate.** Make primary actions obvious and consequential actions explicit.
- **Show only what is known.** Use loading, empty, error, and unavailable states. Never fill missing financial data with zero or invented metrics.
- **Use color as a signal with a label.** Status and alerts must remain understandable without color.
- **Respect roles and the backend contract.** Only offer actions supported by the current role and available routes.
- **Design for every input mode.** Support keyboard navigation, touch, responsive layouts, and reduced motion.

## Color tokens

Use CSS variables from `:root` rather than one-off colors. Values below are the current implementation.

| Token | Value | Use |
| --- | --- | --- |
| `--surface-base` | `#0b0e13` | App canvas and page background |
| `--surface` | `#111319` | Sidebar, panels, and table surfaces |
| `--surface-raised` | `#191c21` | Inputs, secondary controls, table headings |
| `--surface-elevated` | `#22262e` | Hovered controls and mobile navigation |
| `--surface-bright` | `#36393f` | Highest contrast neutral surface |
| `--emerald` | `#00e599` | Primary actions, links, active navigation, positive status |
| `--emerald-light` | `#33ebad` | Primary hover and focus accent |
| `--emerald-muted` | `rgba(0, 229, 153, 0.12)` | Subtle positive and active backgrounds |
| `--cyan` | `#38bdf8` | Secondary informational emphasis where needed |
| `--amber` | `#f59e0b` | Partial, pending, or caution status |
| `--amber-muted` | `rgba(245, 158, 11, 0.14)` | Caution background |
| `--coral` | `#ef4444` | Errors and overdue/failed status |
| `--coral-muted` | `rgba(239, 68, 68, 0.14)` | Error background |
| `--text` | `#f3f4f6` | Main text |
| `--text-2` | `#9ca3af` | Supporting text, labels, muted content |
| `--text-3` | `#6b7280` | Tertiary text; use sparingly |
| `--on-primary` | `#052e16` | Text on emerald primary actions |
| `--border` | `rgba(255, 255, 255, 0.07)` | Standard dividers and panel borders |
| `--border-strong` | `rgba(255, 255, 255, 0.12)` | Control borders and stronger separators |

Use emerald for the main call to action and active destination. Amber and coral communicate caution and failure. Always pair these accents with visible text or an icon with an accessible name; do not rely on color alone.

## Typography

| Role | Current style | Guidance |
| --- | --- | --- |
| Interface | Hanken Grotesk, system sans-serif fallbacks | Use for navigation, labels, body copy, and controls. |
| Numeric/data | JetBrains Mono where code-like; tabular numerals for data | Keep amounts and aligned numeric values easy to compare. |
| Body | `0.875rem / 1.25rem`, regular | Use concise, plain-language explanations. |
| Page title (`h1`) | `1.375rem / 1.75rem`, slightly tight tracking | One clear title per page. |
| Section title (`h2`) | `1.125rem / 1.5rem` | Label meaningful content groups. |
| Supporting text | `0.75rem`, `--text-2` | Use for help, context, and secondary metadata. |
| Table heading | `0.6875rem`, uppercase, letter-spaced | Keep headings brief and recognizable. |

Use semantic heading levels in document order. Format currency and dates consistently and include enough context for users to understand the amount or date.

## Shape, spacing, and elevation

| Token or convention | Current value | Use |
| --- | --- | --- |
| `--radius-md` | `0.5rem` | Inputs, buttons, navigation links |
| `--radius-lg` | `0.75rem` | Panels and table containers |
| Base spacing | Multiples of `0.25rem` | Use the existing spacing rhythm for gaps and padding. |
| Sidebar width | `14rem` | Wide-screen app shell |
| Content max width | `72rem` | Main content reading and scanning area |
| Mobile nav height | `--nav-h: 3.5rem` | Fixed bottom navigation |

Separate surfaces with subtle borders. Use panel shadows sparingly; the interface should feel layered without competing with data.

## Layout and responsive behavior

### Wide screens

- Use a fixed-width left sidebar and flexible content column.
- Keep the sidebar available while scrolling and the main content centered within its maximum width.
- Place the page title and a relevant primary action in a wrapping page header.
- Group related content into panels and grids without adding decorative metrics.

### Narrow screens (800px and below)

- Replace the sidebar with a sticky top bar and fixed, horizontally scrollable bottom navigation.
- Reduce main content padding while retaining readable separation between sections.
- Stack key-value rows vertically.
- Present table values as labeled rows. Keep cell labels visible when the table header is visually hidden.
- Ensure important actions remain visible and touch targets are at least `2.75rem` high.
- Account for device safe areas around fixed navigation.

## Components and patterns

### App shell and navigation

- Show the KodiLedger identity, role-aware primary navigation, role context, and sign-out action in the authenticated shell.
- Mark the active route with `aria-current="page"` and the emerald muted active style.
- Keep mobile navigation keyboard accessible and horizontally scrollable when needed.
- A hidden link is not a permission check; backend authorization remains authoritative.

### Page header

Use a concise title, optional supporting description, optional back link, and one related primary action when available. Let content wrap at smaller widths; do not truncate the action or title.

### Panels and data states

- `.panel`: grouped content with a subtle border and raised surface.
- `.panel-empty`: explain what is empty and, where possible, give a supported next step.
- `.panel-error`: explain the failure and offer retry when appropriate.
- `.panel-amber`: cautionary information.
- `.skeleton`: current loading treatment; communicate loading with text and a status role.
- `.unavailable`: subdued unavailable information; do not style it as a real value.

Keep loading, empty, error, access denied, and unavailable states distinct. Preserve user input after recoverable form errors.

### Buttons and links

- `.btn-primary`: the page's primary supported action.
- `.btn`: secondary action or neutral control.
- `.btn-ghost`: lower-emphasis action.
- Use links to navigate and buttons to perform actions.
- Disabled buttons must remain visibly disabled and must not be the only explanation for why an action is unavailable.

### Forms

- Stack fields vertically and keep forms to a readable width.
- Associate every control with a visible label; connect help and error messages using `aria-describedby` where applicable.
- Put field-level validation next to the affected input and identify errors in text.
- Use input modes appropriate to the value, and explain formats such as dates when needed.
- Disable duplicate submissions while saving and communicate progress and success.
- For payment assignment, show the selected payment and tenant in an explicit confirmation step before submission.

### Tables and record details

- Wrap tables in `.table-wrap` and use `.table` for consistent spacing and borders.
- Include a descriptive caption. Use column headers with `scope="col"`.
- Use `data-label` on each data cell so mobile row layouts keep their meaning.
- Keep values and statuses legible; use tabular numerals for financial and other numeric data.
- Use a contextual record label as the main identifier. Do not foreground raw IDs unnecessarily.
- Make horizontally scrollable table regions keyboard reachable.

### Status badges

Use `.badge` variants and preserve the underlying status as visible text. Current variants are:

| Variant | Color meaning | Examples currently grouped by component |
| --- | --- | --- |
| `.badge-paid` | Positive/complete (emerald) | Paid, reconciled, active, allocated, completed, success, resolved, confirmed |
| `.badge-partial` | In progress or pending (amber) | Partial, partially paid, pending, unassigned, open, issued |
| `.badge-overdue` | Failed or needs attention (coral) | Overdue, failed, cancelled, void, rejected, expired |
| `.badge-vacant` | Neutral (gray) | Vacant and unrecognized values |

Confirm semantic mappings with product owners when adding statuses; the visual treatment must not change the status meaning.

## Interaction and accessibility

- Maintain a clearly visible `:focus-visible` outline. Never remove keyboard focus without an equivalent.
- Provide a skip-to-content link and a focusable main region.
- Use semantic landmarks, headings, real buttons, links, and labeled form controls.
- Use textual `role="alert"` or status messaging for errors, loading, validation, and success as appropriate.
- Keep contrast legible across base, raised, hover, disabled, and status surfaces.
- Respect `prefers-reduced-motion`; motion must not be needed to understand a change.
- Do not communicate meaning with color alone.

## Content and data integrity

- Use plain language and describe the user's task rather than internal API terminology.
- Render only information returned by supported backend routes.
- Do not invent dashboard KPIs, matching confidence, or financial totals.
- Never show unavailable values as zero.
- Keep role-specific navigation and actions consistent with documented permissions.
- Treat field names, pagination, and other items listed as unverified in `README.md` as implementation assumptions, not design facts.

## Implementation references

- Tokens and global patterns: `src/app/globals.css`
- Role navigation: `src/lib/auth/roles.ts`, `src/components/Nav.tsx`
- Tables: `src/components/DataTable.tsx`
- Status badges: `src/components/StatusBadge.tsx`
- Page headers: `src/components/PageHeader.tsx`
- Data states: `src/components/DataState.tsx`
- Forms: `src/components/ResourceForm.tsx`
- Product scope and assumptions: `README.md`
- UX journeys: `userflow.md`
