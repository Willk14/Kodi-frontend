# KodiLedger Component Reference

This catalog describes the shared React components in `src/components/`. It records their current behavior and intended use; `src/app/globals.css` defines their visual styles. Product scope and role limits are documented in `README.md`.

## Shared component rules

- Prefer these shared components and existing CSS classes when building a new page.
- Use links for navigation and buttons for actions.
- Keep labels, status, validation, and errors textual; color is a supporting cue only.
- Distinguish loading, empty, error, and unavailable content.
- Never turn missing financial data into a zero or an invented value.
- Keep role-aware UI consistent with `src/lib/auth/roles.ts`; the backend remains authoritative.
- Preserve visible keyboard focus and touch targets of at least `2.75rem`.

## App shell and access

### `AppShell`

**File:** `src/components/AppShell.tsx`

Provides the authenticated page frame: KodiLedger identity, desktop sidebar, mobile top bar and bottom navigation, role badge, sign-out actions, and skip-to-content link.

**Props:** `children: ReactNode`

**Behavior:** Reads the signed-in role and current route from app context. The active navigation destination is set by `Nav`. Main content is rendered in a focusable `<main id="main">`.

**Use:** Wrap authenticated route content. Do not duplicate the shell inside individual pages.

### `Nav`

**File:** `src/components/Nav.tsx`

Renders role-filtered navigation links and marks the active route.

**Props:** `role: Role`, `pathname: string`, `variant: "side" | "bottom"`

**Accessibility:** Uses a labeled `<nav>` landmark and `aria-current="page"` on the active link. The bottom variant is styled for mobile overflow.

### `RoleGate`

**File:** `src/components/RoleGate.tsx`

Controls whether page content is shown for an allowed role.

**Props:** `roles: Role[]`, `children: ReactNode`

**States:** Renders nothing while auth is unresolved; renders children for allowed roles; otherwise renders a role-specific unavailable panel.

**Important:** This is a UX gate only. API requests still require backend authorization.

### `Unavailable`

**File:** `src/components/RoleGate.tsx`

Shows a subdued, non-interactive explanation for unavailable functionality.

**Props:** `title: string`, `reason: string`

**Use:** Only for genuinely unavailable information or a feature that is not offered. Do not use it to represent a failed request; use `DataState` instead.

## Authentication screens

### `LoadingScreen`

**File:** `src/components/AuthScreens.tsx`

Centered loading state for app startup or auth resolution.

**Props:** `label?: string` (defaults to “Loading…“)

**Accessibility:** The wrapper has `role="status"` and `aria-live="polite"`.

### `MisconfiguredScreen`

Shows missing public environment configuration and points users to `.env.example` and the README.

**Props:** `missing: string[]`

### `NoMembershipScreen`

Explains that the signed-in identity does not have exactly one active KodiLedger membership and offers sign out. It does not offer unsupported registration or membership switching.

**Props:** None

### `AuthErrorScreen`

Explains that the workspace could not be loaded and provides retry and sign-out actions.

**Props:** `message: string`

**Accessibility:** The error message uses `role="alert"`.

## Page structure and data display

### `PageHeader`

**File:** `src/components/PageHeader.tsx`

Standard page heading with optional description, back link, and action area.

**Props:**

- `title: string`
- `description?: string`
- `back?: { href: string; label: string }`
- `action?: ReactNode`

**Use:** Keep the title specific to the page and the action directly related to the page task. The header wraps on narrow screens.

### `DataState`

**File:** `src/components/DataState.tsx`

Selects a UI state for loaded data and renders supplied content when available.

**Props:**

- `state: LoadState<T>`
- `onRetry?: () => void`
- `isEmpty?: (data: T) => boolean`
- `emptyTitle?: string`
- `emptyHint?: string`
- `children: (data: T) => ReactNode`

**Behavior:** Loading shows a polite status message; errors render `ErrorPanel`; empty data shows a panel and optional hint; otherwise children receive the loaded data.

### `ErrorPanel`

**File:** `src/components/DataState.tsx`

Shows an API or request error with a status-aware heading and optional retry action.

**Props:** `error: Error`, `onRetry?: () => void`

**Behavior:** Uses “Not permitted” for HTTP 403 and “Not found” for 404. Retry is omitted for those statuses. API retry-after information is shown for HTTP 429 when available.

**Accessibility:** Uses `role="alert"`.

### `DataTable`

**File:** `src/components/DataTable.tsx`

Displays records in a semantic table with optional row-level navigation.

**Props:**

- `rows: Record<string, unknown>[]`
- `columns: Column[]`
- `caption: string`
- `hrefFor?: (row: Record<string, unknown>) => string | null`

**Behavior:** Formats scalar values, renders known status fields with `StatusBadge`, and adds a “View” link when `hrefFor` returns a URL. Rows without IDs use their index for the React key; rows without a URL have no view link.

**Accessibility and responsive behavior:** Caption is available to screen readers; headers use `scope="col"`; each cell has a `data-label` for the mobile labeled-row layout. The overflow region is keyboard focusable and labeled with the caption.

### `KeyValue`

**File:** `src/components/KeyValue.tsx`

Renders non-hidden scalar DTO fields as a semantic description list, formatting values and status fields.

**Props:** `data: Record<string, unknown>`

**Empty state:** Shows “No details available.” when there are no displayable fields.

## Lists and forms

### `ResourceList`

**File:** `src/components/ResourceList.tsx`

Reusable resource-list page: loads records, renders a `PageHeader`, optional create link and extra content, then a derived `DataTable` or empty/error/loading state.

**Props:**

- `title: string`
- `description?: string`
- `load: () => Promise<Record<string, unknown>[]>`
- `basePath: string`
- `emptyTitle: string`
- `emptyHint?: string`
- `create?: { href: string; label: string }`
- `extra?: ReactNode`

**Behavior:** Record detail links use the record ID encoded into `basePath`. Only provide `create` when creation is supported for the current role and route.

### `InlineTable`

**File:** `src/components/ResourceList.tsx`

Read-only table for a sub-collection such as units, allocations, or credits.

**Props:** `title`, `state`, `onRetry`, `emptyTitle`, optional `basePath`

**Accessibility:** Renders a labeled section and a captioned `DataTable`. Links appear only when a `basePath` is supplied and a row has an ID.

### `ResourceForm`

**File:** `src/components/ResourceForm.tsx`

Renders fields from `FieldSpec[]`, validates values, builds a request payload, submits it, and displays field or form feedback.

**Props:**

- `specs: FieldSpec[]`
- `initial?: Record<string, string>`
- `submitLabel: string`
- `patch?: boolean` — send only changed fields and reject an empty update
- `onSubmit: (payload: Record<string, string>) => Promise<void>`
- `successMessage?: string`

**Behavior:** Disables the submit button during submission; preserves input values after recoverable errors; maps API field errors to their inputs; shows success as a status message. In non-production environments it displays a note that field names may be provisional.

**Accessibility:** Visible labels are connected to inputs; help and error text are connected with `aria-describedby`; invalid inputs use `aria-invalid`; field errors use `role="alert"`.

### `AssignTenant`

**File:** `src/components/AssignTenant.tsx`

Two-step control for explicitly assigning an unassigned payment to a tenant.

**Props:**

- `paymentId: string`
- `tenants: Tenant[] | null` — `null` indicates the tenant list is unavailable and enables UUID entry fallback
- `onAssign: (paymentId: string, body: Record<string, string>) => Promise<void>`
- `onDone: () => void`

**Behavior:** User selects or enters a tenant, chooses Assign, then confirms. UUID validation occurs before submission. Changing the selection clears the confirmation state. Success calls `onDone`; HTTP 409 explains that the payment was already resolved and prompts a queue refresh; other failures show an error.

**Design requirement:** Make the payment and chosen tenant clear before the final confirmation. Do not present this as automatic matching.

## Status

### `StatusBadge`

**File:** `src/components/StatusBadge.tsx`

Displays a textual status in a color-coded badge. `statusVariant(status)` maps known status strings to `paid`, `partial`, `overdue`, or neutral `vacant` styles. The original status text remains visible, with underscores replaced by spaces.

**Props:** `status: string`

Confirm the semantic mapping when adding new status values. Color supports the text and must not replace it.

## Styling reference

Components use shared classes and tokens from `src/app/globals.css`, including `.panel`, `.btn`, `.btn-primary`, `.badge`, `.table`, `.form`, `.field`, and responsive shell classes. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for token values and visual usage rules.

## Source files

| Component | Source |
| --- | --- |
| `AppShell` | `src/components/AppShell.tsx` |
| `AssignTenant` | `src/components/AssignTenant.tsx` |
| `AuthScreens` components | `src/components/AuthScreens.tsx` |
| `DataState`, `ErrorPanel` | `src/components/DataState.tsx` |
| `DataTable` | `src/components/DataTable.tsx` |
| `KeyValue` | `src/components/KeyValue.tsx` |
| `Nav` | `src/components/Nav.tsx` |
| `PageHeader` | `src/components/PageHeader.tsx` |
| `ResourceForm` | `src/components/ResourceForm.tsx` |
| `ResourceList`, `InlineTable` | `src/components/ResourceList.tsx` |
| `RoleGate`, `Unavailable` | `src/components/RoleGate.tsx` |
| `StatusBadge`, `statusVariant` | `src/components/StatusBadge.tsx` |
