# KodiLedger UX Design Brief

## Project overview

KodiLedger is a web app for managing rental properties and reviewing the financial activity connected to them. The frontend supports landlord, caretaker, and tenant experiences through role-aware navigation. Its core job is to make property operations and rental money records understandable, dependable, and easy to review.

This brief guides UX design for the existing frontend and its supported workflows. It reflects the current product foundation described in `README.md` and the interface conventions in `design.md`.

## The problem to solve

Rental information is often spread across property records, tenant details, invoices, payments, and ledger entries. Users need a clear way to find the right record, understand its current state, and take only the actions available to their role. Financial screens must communicate what is known and what is missing without implying unsupported totals, matches, or actions.

## Goals

- Help users reach the property, tenant, invoice, payment, or ledger record they need with minimal navigation.
- Make payment and invoice status, amounts, and dates easy to scan and interpret.
- Support safe, explicit workflows for creating supported records and assigning an unassigned payment.
- Make role and access states understandable, including signed-out, loading, no-membership, and error states.
- Keep key workflows usable on small screens and with keyboard or assistive technology.

## Non-goals

- Adding product capabilities that lack a supported backend route.
- Showing invented dashboard totals, match confidence, or other unverified metrics.
- Building STK Push, tenant invoice self-service, caretaker financial workflows, ledger mutations, or offline financial-data access.
- Adding edit or delete actions beyond the existing supported unit update flow.

## Users and needs

### Landlord

Needs to manage property and unit records, create tenant and invoice records, review payments and ledger activity, and resolve unassigned payments. Needs confidence that a financial action is deliberate and that the displayed state comes from available records.

### Caretaker

Needs to access the property and tenant information enabled for their role. Navigation and pages should avoid presenting landlord-only financial actions as available.

### Tenant

Needs to find their tenant home and review payment information available to them. The experience should use plain language and make account or membership problems actionable where possible.

## Primary journeys

1. **Sign in and enter the right workspace:** Enter credentials, resolve the session and role, then land in the appropriate role-aware app shell. Clearly explain invalid credentials, configuration problems, expired sessions, and missing membership.
2. **Find a property or tenant:** Open the relevant list, scan labeled records, and follow a clear link to the detail view. On mobile, preserve each value's label when table headers are not visible.
3. **Create a tenant or invoice:** Start from a clear page action, complete a focused form with contextual help, receive field-level validation, and get a clear success or error result.
4. **Review a payment:** Open a payment from the list, understand its status and amount, and inspect allocations or credits where available.
5. **Assign an unassigned payment:** Review the payment and proposed tenant context, explicitly choose the intended tenant, confirm the assignment, and communicate success or failure. Do not imply automatic matching.
6. **Review ledger activity:** Browse paginated records and open an entry for details. Keep unavailable or unverified information visibly unavailable rather than filling gaps with assumptions.

## Information architecture

Use a persistent, role-aware navigation shell. Current sections include Home, Properties, Units, Tenants, Invoices, Payments, Unassigned Payments, and Ledger, with visibility governed by role. Keep the current location clear and maintain predictable back-and-forth movement between lists and detail pages.

Page hierarchy should generally follow: page title and short context; primary supported action when applicable; filters or list context only where implemented; main records or form; then clear loading, empty, error, and unavailable states.

## UX and visual direction

Use the existing **Obsidian Ledger** visual language: dark charcoal surfaces, restrained borders, emerald primary actions, and clear status accents. Keep layouts compact and information-dense while preserving breathing room around important financial values. Use tabular numerals for amounts and consistent formatting for currency and dates. Color must reinforce visible status text, never replace it.

Prefer familiar language over backend terminology. Use record names and contextual labels as the primary identifiers; avoid making raw IDs the first thing users see. Show a short explanation when information is unavailable or an action cannot be taken.

## Interaction principles

- Make the next useful action clear, with one primary action per page or form where practical.
- Ask for confirmation before consequential payment assignment, and state which payment and tenant are involved.
- Keep validation close to the affected field; retain entered values after recoverable errors.
- Distinguish loading, empty, error, and unavailable states with concise explanatory text and a relevant recovery action when one exists.
- Do not make a successful-looking state from missing data or failed requests.
- Use links for navigation and buttons for actions; provide visible keyboard focus and semantic landmarks.

## Responsive and accessibility requirements

- Preserve the desktop pattern of a fixed-width sidebar and flexible content area.
- At narrow widths, use the existing sticky top bar and bottom navigation pattern; keep touch targets at least 2.75rem high.
- Allow page headers and form controls to wrap or stack without obscuring actions.
- Keep tables readable on small screens by exposing each cell's label with its value; ensure horizontally scrollable regions are keyboard reachable.
- Use semantic headings, navigation landmarks, associated form labels and help text, textual status and error messages, and `aria-current="page"` for the active destination.
- Respect reduced-motion preferences and maintain readable contrast across surfaces and states.

## Content and data rules

- Show only data returned by supported routes; do not fabricate metrics or infer financial status.
- Keep currency, decimal precision, and date formatting consistent and understandable in context.
- Explain unavailable information plainly; never represent it as zero.
- Treat role permissions as product behavior: only surface actions supported for the signed-in role.
- Keep assumptions about API fields or pagination out of user-facing copy.

## Success measures

Evaluate the design with task-based usability sessions and instrumentation where available. Suggested measures:

- Users can identify their role and find their primary section without assistance.
- Users can locate a target property, tenant, invoice, or payment accurately.
- Landlords can complete tenant and invoice creation with low form error and abandonment rates.
- Users can correctly explain the state and amount of a payment or ledger item.
- Landlords can complete payment assignment without selecting the wrong tenant or misunderstanding what will happen.
- Users can recover from empty, loading, access, and request-error states.
- Core tasks remain usable at mobile widths and by keyboard.

Set numeric targets after establishing a baseline with representative landlords, caretakers, and tenants; avoid treating unvalidated targets as product facts.

## Design deliverables

- Role and permission map for navigation and available actions.
- Task flows for sign-in, list-to-detail discovery, tenant and invoice creation, and payment assignment.
- Wireframes for desktop and mobile list, detail, form, and state patterns.
- High-fidelity screens using the existing design tokens and components.
- Prototypes for the payment assignment confirmation and key error/recovery states.
- Accessibility and responsive review notes, plus usability findings and prioritized follow-up changes.

## Constraints and open validation

The current frontend is based on a route list and contains explicitly documented API assumptions. Validate field names, pagination behavior, tenant visibility, and role permissions with the backend contract before finalizing detailed screens. Keep proposed design work within the routes and role behavior documented in the project until those capabilities are confirmed.

## Source references

- `README.md` — implemented workflows, role behavior, limitations, and unverified API assumptions.
- `design.md` — visual system, responsive layout, component conventions, and accessibility rules.
- `src/app/(app)/` — existing route and page structure.
- `src/components/` — existing shell, forms, tables, status, and data-state patterns.
