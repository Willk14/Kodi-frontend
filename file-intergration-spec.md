# KodiLedger file integration specification

This document describes how the FastAPI backend and Next.js frontend integrate. It is stored with the frontend because the backend repository is currently read-only for this work.

## Repositories and responsibilities

- `kodiledger-backend/` owns the HTTP API, OIDC token verification, membership and role resolution, authorization, data access, and response schemas.
- `kodiledger-frontend/kodiledger-frontend/` owns the browser interface, Supabase sign-in/session handling, typed API client, validation and display components.
- The repositories have separate Git histories. Keep frontend changes in the frontend repository and backend changes in the backend repository.
- The frontend must not connect to a database or make ownership decisions. Backend authorization and scoping remain authoritative.

## HTTP and authentication

- Backend routes are mounted under `/api/v1`.
- `NEXT_PUBLIC_API_BASE_URL` is the backend origin only, without `/api/v1` or a trailing slash. The frontend API client appends `/api/v1`.
- The frontend obtains the signed-in user's access token from the Supabase client and sends it as `Authorization: Bearer <token>` to protected API routes.
- The backend validates OIDC issuer, audience, expiry, issued-at time, signature, and JWKS key. It resolves `(issuer, subject)` to its local user and active membership. Token role or ownership claims, query parameters, and frontend state do not establish authorization.
- Role discovery probes `GET /bff/landlord/me`, then `GET /bff/caretaker/me`, then `GET /tenants/me`. A 403 or 404 advances to the next probe. There is no unified who-am-I route.
- Never put a Supabase service-role key in browser code or any `NEXT_PUBLIC_` variable.

## CORS and configuration

The backend deployment must include each frontend origin in `CORS_ALLOWED_ORIGINS`, as a comma-separated list. The current backend allows credentials, methods `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`, and headers `Authorization`, `Content-Type`, and `Idempotency-Key`.

Protected backend requests also require backend OIDC configuration: HTTPS issuer URL, audience, HTTPS JWKS URL, and an explicit asymmetric signing algorithm allowlist. The frontend requires these public values in its local environment:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No secret or live environment value belongs in this document.

## Verified API surface used by the frontend

| Resource/workflow | Routes used | Access enforced by backend |
| --- | --- | --- |
| Role context | `GET /bff/landlord/me`, `GET /bff/caretaker/me`, `GET /tenants/me` | Each route validates the corresponding active role/context. |
| Properties | `GET /properties`, `GET /properties/{property_id}` | LANDLORD only. |
| Units | `GET /properties/{property_id}/units`, `POST /properties/{property_id}/units`, `GET /units/{unit_id}`, `PATCH /units/{unit_id}` | LANDLORD and CARETAKER read; LANDLORD create/update. |
| Tenants | `GET /tenants`, `GET /tenants/{tenant_id}`, `GET /tenants/me`, `POST /tenants` | LANDLORD and CARETAKER list/detail; TENANT self-read; LANDLORD create. |
| Invoices | `GET /invoices`, `GET /invoices/{invoice_id}`, `POST /invoices` | LANDLORD only. |
| Payments | `GET /payments`, `GET /payments/{payment_id}`, `GET /payments/{payment_id}/allocations`, `GET /payments/{payment_id}/credits` | LANDLORD and TENANT, with tenant records constrained to their own backend-resolved scope. |
| Unassigned payments | `GET /unassigned-payments`, `POST /unassigned-payments/{payment_id}/resolve` | LANDLORD with payment-assignment permission. |
| Ledger | `GET /ledger`, `GET /ledger/{entry_id}` | LANDLORD with payment-read permission. |

The frontend does not call or expose `POST /payments/stk-push`. It does not call the admin STK queue/query or webhook routes.

## Request and response rules

- Request field names and constraints are represented in `src/lib/api/contract.ts` and generated API schema types.
- Unit create accepts `unit_number`, `base_rent`, and optional `garbage_fee`, `security_fee`, `water_rate_per_unit`. Unit patch accepts those same fields, requires one or more values, and rejects explicit nulls. Unknown request fields are rejected.
- Tenant create requires `unit_id`, `full_name`, `primary_phone`, and `lease_start_date`; `deposit_amount` and `id_number` are optional. The API does not return the government ID number.
- Invoice create requires `unit_id`, `tenant_id`, `invoice_number`, `billing_month`, `rent_amount`, and `due_date`; component amounts are optional and default to zero. Unknown fields are rejected.
- Unassigned-payment resolution requires only `tenant_id`; unknown fields are rejected.
- Monetary values stay decimal strings in frontend request/view-model code and API responses. Formatting must not convert money to JavaScript `number` or perform arithmetic.
- View-model mappers expose only fields intentionally selected for presentation. They omit landlord scope, government identifiers, and raw provider/webhook payload fields.
- Ledger pagination uses `limit` (default 50, maximum 100) and `offset` (default 0), returning `{items,total,limit,offset}`. Supported filters are `payment_transaction_id`, `tenant_id`, `invoice_id`, `unit_id`, `property_id`, `receipt`, `created_from`, and `created_to`.
- Collection routes other than ledger and the admin STK queue do not use a shared pagination contract.

## Errors and frontend states

Backend errors do not have one uniform envelope. Request validation returns 422 with a FastAPI `detail` array. Most HTTP errors return `{"detail": ...}`. The frontend branches on status and presents loading, empty, error, and successful data/form states. It handles 401, 403, 404, 409, 422, 429, 500, 502, and 503. A 429 may include `Retry-After`; the backend documents it for STK initiation, a route the frontend does not use.

Frontend tests check client behavior, view-model mapping, UI states, and route presence in the checked-in OpenAPI file. They do not establish backend authorization, deployed schema, database, or RLS correctness.

## Contract refresh workflow

1. Inspect backend route and schema changes in `kodiledger-backend/` without modifying them during frontend-only work.
2. Export `app.openapi()` to `contracts/openapi.json` from the frontend working directory using the backend virtual environment, `PYTHONDONTWRITEBYTECODE=1`, and non-secret placeholder settings. Do not start the FastAPI lifespan or connect to the database.
3. Record the backend commit used in `contracts/SOURCE.txt`.
4. Run `npm run gen:api` in the frontend repository. Do not hand-edit `src/lib/api/generated/schema.d.ts`.
5. Update typed request/response aliases, mappers, explicit resource columns, and fixtures when the contract changes.
6. Run `npm run typecheck`, `npm test`, and `npm run build` from the frontend repository.

## Known backend gaps

- No unified who-am-I endpoint.
- No tenant invoice self-service or caretaker property/payment routes.
- No generic list pagination/filter convention outside the documented exceptions.
- Error response details are route-specific; `Retry-After` is not a general rate-limit contract.
- No property edit/delete, tenant edit/delete, invoice edit/delete, unit delete, ledger mutation/reversal, or membership provisioning/switching routes are used by this frontend.
