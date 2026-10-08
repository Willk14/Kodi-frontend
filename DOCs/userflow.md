# KodiLedger User Flows

This document maps the user journeys supported by the current KodiLedger frontend. It is a UX and navigation reference; backend authorization remains authoritative. Role visibility and API field assumptions are documented in `README.md` and `src/lib/auth/roles.ts`.

## 1. Sign in and enter the role workspace

```mermaid
flowchart TD
    A[Open app] --> B{Valid session?}
    B -- No --> C[Sign-in screen]
    C --> D[Enter email and password]
    D --> E{Credentials accepted?}
    E -- No --> C1[Show sign-in error; allow retry]
    C1 --> D
    E -- Yes --> F[Resolve membership and role]
    B -- Yes --> F
    F --> G{Role found?}
    G -- Landlord --> H[Landlord home]
    G -- Caretaker --> I[Caretaker home]
    G -- Tenant --> J[Tenant home]
    G -- No membership --> K[Explain account has no recognized membership]
    F --> L{Session or service error?}
    L -- Yes --> M[Show error and available recovery action]
```

**Design notes:** Keep sign-in and membership resolution states distinct. Do not expose the app shell until role resolution succeeds. Provide retry or sign-out where useful; do not imply a user can self-provision a membership.

## 2. Role-aware navigation

| Destination | Landlord | Caretaker | Tenant |
| --- | :---: | :---: | :---: |
| Home | Yes | Yes | Yes |
| Properties | Yes | Yes | — |
| Tenants | Yes | Yes | — |
| Invoices | Yes | — | — |
| Payments | Yes | — | Yes |
| Unassigned payments | Yes | — | — |
| Ledger | Yes | — | — |

Units are reached through a property and can be opened by direct unit links. Unit creation and updates are landlord-only. Hiding navigation is a usability choice, not an authorization check; handle backend access errors clearly.

## 3. Browse properties, units, or tenants

```mermaid
flowchart TD
    A[Choose Properties or Tenants] --> B{Request state}
    B -- Loading --> C[Show loading state]
    B -- Error --> D[Explain failure; offer retry]
    B -- Empty --> E[Explain there are no records]
    B -- Records --> F[Scan labeled list]
    F --> G[Open a record]
    G --> H{Detail request state}
    H -- Loading --> I[Show loading state]
    H -- Error --> J[Explain failure; offer retry or return]
    H -- Record --> K[Show record details]
    K -- Property --> L[Open related units]
```

**Design notes:** Use recognizable names and context before identifiers. On narrow screens, retain each table cell's label with its value. Keep list-to-detail navigation reversible with a clear path back.

## 4. Create a tenant (landlord or caretaker where permitted)

```mermaid
flowchart TD
    A[Open Tenants] --> B[Choose Add tenant]
    B --> C[Complete labeled form]
    C --> D{Client validation passes?}
    D -- No --> E[Show field-level guidance]
    E --> C
    D -- Yes --> F[Submit tenant]
    F --> G{Request succeeds?}
    G -- No --> H[Show error; preserve entered values]
    H --> C
    G -- Yes --> I[Show success and open or link to tenant record]
```

Only show fields supported by the implemented form and verified API contract. Do not imply that tenant account credentials or membership are created here.

## 5. Create an invoice (landlord)

```mermaid
flowchart TD
    A[Open Invoices] --> B[Choose Create invoice]
    B --> C[Enter supported invoice details]
    C --> D{Values valid?}
    D -- No --> E[Show field-specific validation]
    E --> C
    D -- Yes --> F[Review and submit]
    F --> G{Request succeeds?}
    G -- No --> H[Show error; retain form values]
    H --> C
    G -- Yes --> I[Show confirmation and invoice details]
```

Use clear currency and date labels. Do not present unsupported invoice editing, deletion, or tenant self-service actions.

## 6. Review a payment

```mermaid
flowchart TD
    A[Open Payments] --> B{Role}
    B -- Landlord or tenant --> C[Load payment list]
    C --> D{List state}
    D -- Loading --> E[Show loading]
    D -- Error --> F[Explain failure; offer retry]
    D -- Empty --> G[Explain no payments are available]
    D -- Records --> H[Choose a payment]
    H --> I[Open payment details]
    I --> J[Show available payment fields and status]
    I --> K[Load allocations and credits where available]
    K --> L{Related data state}
    L -- Empty --> M[Explain no related entries are available]
    L -- Error --> N[Show unavailable/error state without inventing values]
    L -- Records --> O[Show allocations or credits]
```

The tenant view is limited to the `/payments` route and data returned for that user. Do not add tenant invoice self-service or payment initiation.

## 7. Assign an unassigned payment (landlord)

```mermaid
flowchart TD
    A[Open Unassigned Payments] --> B{Queue state}
    B -- Loading --> C[Show loading]
    B -- Error --> D[Explain failure; offer retry]
    B -- Empty --> E[Explain queue is clear]
    B -- Records --> F[Review payment details]
    F --> G[Select tenant]
    G --> H{Valid tenant selected?}
    H -- No --> I[Ask user to select a tenant]
    I --> G
    H -- Yes --> J[Show explicit assignment confirmation]
    J --> K{Confirm assignment?}
    K -- Cancel/change --> G
    K -- Confirm --> L[Submit assignment]
    L --> M{Result}
    M -- Success --> N[Show success and refresh queue]
    M -- Already resolved --> O[Explain it was resolved; refresh queue]
    M -- Other error --> P[Show error; allow correction or retry]
```

State which payment and tenant are involved before confirmation. Never describe the selection as an automatic match or display a match-confidence score. If the tenant list cannot be loaded, explain the fallback clearly and validate the entered tenant identifier before submission.

## 8. Review ledger activity (landlord)

```mermaid
flowchart TD
    A[Open Ledger] --> B[Load current page]
    B --> C{Request state}
    C -- Loading --> D[Show loading]
    C -- Error --> E[Explain failure; offer retry]
    C -- No entries --> F[Explain no ledger entries are available]
    C -- Entries --> G[Review paginated list]
    G --> H[Open entry]
    H --> I{Detail request succeeds?}
    I -- No --> J[Explain failure; offer retry or return]
    I -- Yes --> K[Show available entry details]
    G --> L[Next or previous page when available]
```

Pagination behavior and available filters depend on the verified API contract. Do not invent filters or ledger mutation actions.

## 9. Shared states and recovery

| State | User experience |
| --- | --- |
| Loading | Show that content is loading without implying a result. Keep layout stable where practical. |
| Empty | Say what is empty and offer a supported next step if one exists. |
| Error | Explain that the request failed; provide retry or return navigation when possible. Preserve form values after recoverable failures. |
| Unavailable | Explain that information is unavailable. Do not show zero or placeholder financial figures as real data. |
| Access denied | Explain the user cannot access the destination; provide a safe return path. Role-aware navigation does not replace backend authorization. |
| Success | Confirm the completed action in plain language and link to the relevant record or refreshed list. |

All states must have visible text, keyboard-accessible actions, semantic structure, and sufficient contrast. Status color must always be paired with a text label.

## Unsupported journeys

Do not design as active workflows until product and backend support is confirmed: STK Push, tenant invoice self-service, caretaker financial actions, ledger mutations, registration or membership provisioning, property/tenant/invoice edit or delete, and offline financial data. See `README.md` for the full implementation boundary and known API assumptions.
