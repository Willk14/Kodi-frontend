# KodiLedger frontend

Next.js 14 App Router, React 18, strict TypeScript, Supabase sign-in, and typed clients generated from the FastAPI contract. The interface uses the Obsidian Ledger tokens in `src/app/globals.css`.

## Install and run

Run from this directory (the one containing `package.json`):

```sh
npm install
npm run dev
```

The development server defaults to `http://localhost:3000`.

## Configuration

Copy `.env.example` to `.env.local` and fill in the public client values:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend host root, with no trailing slash and no `/api/v1`; the client appends that prefix. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used for sign-in/session only. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key. Never use a service-role key in browser code or a `NEXT_PUBLIC_` variable. |

Set the backend `CORS_ALLOWED_ORIGINS` to the exact frontend origins, comma-separated (for local development, include `http://localhost:3000`). The backend allows credentials and the API methods `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`; allowed headers include `Authorization`, `Content-Type`, and `Idempotency-Key`. Do not change backend CORS settings as part of frontend setup.

Protected backend requests send the Supabase access token as a Bearer token. The backend must be configured with a valid HTTPS OIDC issuer, audience, HTTPS JWKS URL, and asymmetric signing algorithm allowlist. It resolves identity and membership from backend records; frontend roles and navigation are UX only.

## Refresh the API contract and types

`contracts/openapi.json` was exported from backend commit `a2a5d7c4b55ef4011fd4a3ffadd79f4f85fc840f`. To refresh it, run from this frontend directory in PowerShell, using the backend virtual environment. The placeholder values below are disposable settings for schema generation; the app lifespan is not started and no database/provider connection is made. `PYTHONPATH` points to the sibling backend repository and Python runs with bytecode writes disabled.

```powershell
$env:PYTHONDONTWRITEBYTECODE = '1'
$env:PYTHONPATH = '..\..\kodiledger-backend'
$env:POSTGRES_USER = 'contract_export'
$env:POSTGRES_PASSWORD = 'contract_export'
$env:POSTGRES_DB = 'contract_export'
$env:DATABASE_URL = 'postgresql+asyncpg://contract_export:contract_export@127.0.0.1:5432/contract_export'
$env:SYSTEM_DATABASE_URL = 'postgresql+asyncpg://contract_export:contract_export@127.0.0.1:5432/contract_export'
$env:REDIS_URL = 'redis://127.0.0.1:6379/0'
$env:MPESA_CONSUMER_KEY = 'contract_export'
$env:MPESA_CONSUMER_SECRET = 'contract_export'
$env:MPESA_PASSKEY = 'contract_export'
$env:MPESA_SHORTCODE = '1'
$env:MPESA_CALLBACK_URL = 'https://example.invalid/callback'
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:3000'
$env:PYTHON_CODE = "import json; from pathlib import Path; from app.main import app; Path('contracts/openapi.json').write_text(json.dumps(app.openapi(), indent=2) + chr(10), encoding='utf-8')"
& '..\..\kodiledger-backend\venv\Scripts\python.exe' -c $env:PYTHON_CODE
```

This imports `app.main.app` and calls `app.openapi()` without running FastAPI startup/lifespan. Keep the generated contract free of environment data. Then regenerate declarations:

```sh
npm run gen:api
```

The generated file `src/lib/api/generated/schema.d.ts` must not be edited by hand. Money response types remain decimal strings. Run `npm run typecheck`, `npm test`, and `npm run build` after refreshing the contract. A contract-drift test checks every route and method the frontend calls.

## Verified frontend contract

- Routes: landlord/caretaker context probes, properties and units, landlord/caretaker tenant reads plus tenant self-read, landlord invoice reads/create, landlord/tenant payment and allocation/credit reads, landlord unassigned-payment resolution, and landlord ledger reads.
- Unit creation and patch fields use `base_rent` and fee/rate fields. Tenant creation uses `primary_phone`, `lease_start_date`, and optional deposit/ID fields. Invoice creation uses invoice number, billing month, component amounts, and due date.
- Ledger uses `limit` (default 50, max 100), `offset` (default 0), `{items,total,limit,offset}`, and the supported filters implemented on the Ledger screen.
- Landlords can read properties and manage units, tenants, and invoices as exposed by backend routes. Caretakers can read units/tenants but have no property or payment route. Landlords and tenants can read payment history and financial details. The backend remains authoritative.
- Error responses are not uniform: FastAPI validation uses a 422 `detail` array; HTTP errors generally use `{"detail": ...}`. The UI handles 401/403/404/409/422/429/500/502/503 and uses `Retry-After` when provided. The backend documents this header for STK initiation; the frontend does not call that route.
- No unified “who am I” endpoint exists, so membership resolution probes `/bff/landlord/me`, `/bff/caretaker/me`, then `/tenants/me`.

## Screens and unavailable operations

The frontend includes properties, units, tenants, invoices, payments with allocations/credits, unassigned payments, and read-only ledger screens. Unit, tenant, and invoice creation screens submit verified request fields. Invoices, tenants, and payments have wide-screen master/detail lists with `?selected=...` and dedicated detail routes for mobile.

The app does not call or expose `POST /payments/stk-push`; does not implement property/tenant/invoice edit or delete, unit deletion, tenant invoice self-service, caretaker financial workflows, ledger mutation/reversal, or registration/membership provisioning/switching. Unsupported dashboard metrics remain marked unavailable. UI gating is not authorization and does not claim backend or RLS validation.

## Remaining backend gaps

- No unified authenticated identity endpoint; the frontend must probe three role routes.
- No tenant invoice self-service route and no caretaker property/payment route.
- No shared pagination/filter convention outside the ledger and STK operator queue.
- Error shapes and status documentation vary by route. `Retry-After` is documented on STK rate limiting only.
- Route and schema verification is based on the checked-in backend source and exported OpenAPI; frontend tests do not verify deployed backend behavior, database state, or RLS.
