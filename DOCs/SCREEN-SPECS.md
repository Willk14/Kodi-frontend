# KodiLedger Screen Specifications

This document describes the current frontend screens and their intended hierarchy, behavior, and states. It is based on implemented routes and components. It does not authorize new backend capabilities. See `README.md` for implementation limits and unverified API assumptions, `userflow.md` for journey diagrams, and `DESIGN-SYSTEM.md` for visual tokens.

## Global shell and screen rules

- Authenticated screens use `AppShell`: desktop sidebar; mobile sticky top bar and bottom navigation; role badge; sign-out; skip-to-content link.
- Navigation is role-aware and the current destination is marked with `aria-current="page"`. Backend authorization remains authoritative.
- Use the shared page header, panels, tables, forms, status badges, and data-state components.
- Every data request must have explicit loading, error, and empty handling where applicable. Unavailable values must not appear as zero.
- Keep headings semantic and concise. Use contextual labels rather than raw IDs as the main identifier.
- On mobile, tables become labeled rows; forms and key-value details stack; actions remain touch-friendly.
- Financial amounts and status values must retain context and visible text. Never add fabricated KPIs or inferred payment matching.

## Public and authentication screens

### Sign in — `/login`

**Audience:** Signed-out users.

**Purpose:** Authenticate an existing KodiLedger account.

**Hierarchy:** Centered card; “Sign in to KodiLedger” title; optional signed-out notice; email field; password field; inline error; primary “Sign in” action; note that account provisioning is handled by KodiLedger.

**Behavior:** Trim the email and submit credentials. Disable the action while signing in and change its label to “Signing in…”. On success, role resolution redirects into the app. Do not show registration, password reset, or membership switching unless supported later.

**States:** Initial/loading and resolving use the centered loading screen. Misconfiguration lists missing public environment variables. Authentication errors appear inline without clearing inputs. A signed-in user is redirected away from login.

**Access and semantics:** Use email and password input types, autocomplete hints, visible labels, and a textual alert for errors.

### Auth resolution — shared screen state

Use the centered loading screen while session and membership are resolving. If no active recognized membership is found, explain that account setup is managed by KodiLedger and provide sign out. For workspace loading errors, show the message plus retry and sign-out actions. Do not expose authenticated navigation before role resolution.

## Home screens — `/`

Home content depends on the resolved role. Use the shared app shell and a page header.

### Landlord home

**Purpose:** Provide a small, truthful starting point and shortcuts.

**Hierarchy:** “Landlord home” title and short explanation; property count card; unavailable cards for rent collected, arrears, and occupancy; account context panel; role-aware “Go to” links.

**Behavior and states:** Property count comes from the properties list and has loading, error/retry, and loaded states. Financial and occupancy cards remain visibly unavailable because no dashboard endpoint is implemented. Quick links reflect landlord navigation.

### Caretaker home

**Purpose:** Orient caretakers to property and tenant tasks.

**Hierarchy:** “Caretaker home” title and explanation of available scope; account context panel; role-aware quick links.

**Restrictions:** Do not add landlord financial summaries or actions.

### Tenant home

**Purpose:** Let a tenant review their own tenant record and available destinations.

**Hierarchy:** “My profile” title and explanation; account/tenant context panel; tenant quick links.

**Restrictions:** Invoice self-service is not available. Do not imply that tenants can initiate payments from this app.

## Property and unit screens

### Properties list — `/properties`

**Audience:** Landlord, caretaker.

**Purpose:** Find a property and open its details.

**Hierarchy:** “Properties” title, Add property action, and a responsive table with derived columns and row links.

**States:** Loading, request error with retry, and “No properties” empty state. Empty hint: no properties are visible to the account.

**Actions:** Add a property with its name, county, town or area, and unit count; open a property.

### Property detail — `/properties/[id]`

**Audience:** Landlord, caretaker.

**Hierarchy:** “Property” title and back link; property details panel; “Units” sub-section; landlord-only “Add a unit” form.

**States:** Property and units load independently and each has loading/error/empty behavior. Unit empty state says no units are in this property.

**Actions:** Open a unit from the unit list. Landlords can create a unit; success refreshes the unit list. Caretakers only view. Unit deletion is unavailable.

### Unit detail — `/units/[id]`

**Audience:** Landlord, caretaker.

**Hierarchy:** “Unit” title and back link to Properties; unit details panel; landlord-only “Edit unit” section.

**Actions:** Landlords can save changed supported fields. On success, show “Unit updated.” and reload details. Caretakers see details without the edit form.

**States:** Loading, not found/error with retry where applicable, details, field validation, save error, and save success.

## Tenant screens

### Tenants list — `/tenants`

**Audience:** Landlord, caretaker.

**Hierarchy:** “Tenants” title; note that tenant edit/delete are unavailable; responsive data table; landlord-only “Add tenant” action.

**States:** Loading, request error with retry, and “No tenants” empty state.

### Add tenant — `/tenants/new`

**Audience:** Landlord only.

**Hierarchy:** “Add tenant” title with back link to Tenants; focused form inside a panel; primary “Create tenant” action.

**Behavior:** Show field-level validation and API errors; preserve entered values on recoverable failure. On success, navigate to the new tenant detail when an ID is returned, otherwise to the tenant list.

**Restrictions:** This creates a tenant record only. Do not imply account credentials or membership are provisioned.

### Tenant detail — `/tenants/[id]`

**Audience:** Landlord, caretaker.

**Hierarchy:** “Tenant” title and back link to Tenants; semantic key-value details panel.

**States:** Loading, error/not found with retry as appropriate, details, and “No details available” when no displayable scalar fields exist.

**Actions:** Read only. Tenant edit and delete are unavailable.

## Invoice screens

### Invoices list — `/invoices`

**Audience:** Landlord only.

**Hierarchy:** “Invoices” title; note that edit/delete are unavailable; responsive table; primary “Create invoice” action.

**States:** Loading, request error with retry, and “No invoices” empty state.

### Create invoice — `/invoices/new`

**Audience:** Landlord only.

**Hierarchy:** “Create invoice” title and back link to Invoices; focused form inside a panel; primary “Create invoice” action.

**Behavior:** Validate fields inline. Preserve values after recoverable errors. On success, navigate to invoice detail if an ID is returned, otherwise return to the invoice list.

### Invoice detail — `/invoices/[id]`

**Audience:** Landlord only.

**Hierarchy:** “Invoice” title and back link to Invoices; semantic key-value details panel.

**States:** Loading, error/not found with retry as applicable, details, and no-displayable-details message.

**Actions:** Read only. Invoice edit and delete are unavailable.

## Payment screens

### Payments list — `/payments`

**Audience:** Landlord, tenant.

**Hierarchy:** “Payments” title; brief note that STK Push is unavailable; responsive table with payment detail links.

**States:** Loading, request error with retry, and “No payments yet” empty state.

### Payment detail — `/payments/[id]`

**Audience:** Landlord, tenant.

**Hierarchy:** “Payment” title and back link to Payments; payment details panel; Allocations section; Credits section.

**States:** Payment, allocations, and credits each load independently. Show each related section's own loading/error/empty state. Use “This payment has no allocations” and “This payment has no credits” for empty sections.

**Actions:** Read only. Do not add payment initiation, allocation mutation, or tenant invoice self-service.

### Unassigned payments — `/unassigned-payments`

**Audience:** Landlord only.

**Purpose:** Review the assignment queue and explicitly link a payment to a tenant.

**Hierarchy:** “Unassigned payments” title; clear warning that assignment cannot be undone in this app; queue state; each payment in a caution panel with key-value details; contextual assignment control.

**States:** Loading, request error with retry, and “Queue is clear” empty state. Tenant lookup failure enables the UUID fallback inside the assignment component; clearly label this path.

**Behavior:** Open one assignment control at a time. Require tenant selection, explicit confirmation, then submission. On success, close the form and reload the queue. If already resolved, explain and refresh. Other errors remain visible for recovery.

**Restrictions:** No automatic match, confidence score, or undo action.

## Ledger screens

### Ledger list — `/ledger`

**Audience:** Landlord only.

**Purpose:** Browse read-only ledger activity.

**Hierarchy:** “Ledger” title and read-only note; responsive table; pagination controls and result range.

**States:** Loading, request error with retry, initial “No ledger entries” empty state, current page, and end-of-results text.

**Behavior:** Previous/Next buttons respect the current offset, page size, and available total or short-page signal. Reset/retain pagination behavior should match the page navigation model. No filters are currently asserted by the API contract.

### Ledger entry detail — `/ledger/[id]`

**Audience:** Landlord only.

**Hierarchy:** “Ledger entry” title and back link to Ledger; semantic key-value details panel.

**States:** Loading, error/not found with retry as applicable, details, and no-displayable-details message.

**Actions:** Read only; no edit or reverse actions.

## Cross-screen state and responsive requirements

| Condition | Specification |
| --- | --- |
| Loading | Use a visible status message. Do not display stale or fabricated values as current results. |
| Empty collection | State clearly that there are no records and offer a supported action only when one exists for the role. |
| Request error | Explain the failure in text and offer retry except when access is denied or a record is not found. |
| Unavailable data | Explain the limitation; never substitute zero or a mock value. |
| Validation error | Place guidance beside the field, mark invalid input, and retain other entered values. |
| Success | Confirm the action in text and update or navigate to the resulting record/list. |
| Mobile | Keep navigation reachable, stack details and forms, expose table labels, and avoid clipped primary actions. |
| Keyboard/assistive tech | Preserve landmarks, heading order, labels, captions, live status/error announcements, and visible focus. |

## Design constraints and validation notes

- The UI is built without a verified backend repository. Confirm assumptions called out in `src/lib/api/contract.ts` before treating field names, pagination, or payload shape as final.
- Route availability and role visibility come from the current frontend implementation and can change only with corresponding backend/product support.
- See `COMPONENT.md` for shared component props and `userflow.md` for task-level flows.
