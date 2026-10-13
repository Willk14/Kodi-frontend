import type { ApiClient, Query } from "./client";
import { PAGINATION } from "./contract";
import type { Allocation, Credit, Invoice, InvoiceCreate, LedgerEntry, Page, Payment, Property, PropertyCreate, ResolveUnassigned, Resolution, Schema, Tenant, TenantCreate, UnassignedPayment, Unit, UnitCreate, UnitPatch } from "./types";

const id = (value: string) => encodeURIComponent(value);
export const FRONTEND_API_ROUTES = [
  "GET /api/v1/bff/landlord/me", "GET /api/v1/bff/caretaker/me", "GET /api/v1/tenants/me",
  "GET /api/v1/properties", "POST /api/v1/properties", "GET /api/v1/properties/{property_id}", "GET /api/v1/properties/{property_id}/units",
  "POST /api/v1/properties/{property_id}/units", "GET /api/v1/units/{unit_id}", "PATCH /api/v1/units/{unit_id}",
  "GET /api/v1/tenants", "GET /api/v1/tenants/{tenant_id}", "POST /api/v1/tenants",
  "GET /api/v1/invoices", "GET /api/v1/invoices/{invoice_id}", "POST /api/v1/invoices",
  "GET /api/v1/payments", "GET /api/v1/payments/{payment_id}", "GET /api/v1/payments/{payment_id}/allocations", "GET /api/v1/payments/{payment_id}/credits",
  "GET /api/v1/unassigned-payments", "POST /api/v1/unassigned-payments/{payment_id}/resolve", "GET /api/v1/ledger", "GET /api/v1/ledger/{entry_id}",
] as const;
export function normalizePage<T>(raw: Page<T> | T[]): Page<T> {
  if (Array.isArray(raw)) return { items: raw, total: raw.length, limit: raw.length, offset: 0 };
  return raw;
}
export function createEndpoints(c: ApiClient) {
  return {
    landlordMe: () => c.get<Schema["LandlordContextRead"]>("/bff/landlord/me"),
    caretakerMe: () => c.get<{ user_id: string; role: string; landlord_id: string }>("/bff/caretaker/me"),
    tenantMe: () => c.get<Tenant>("/tenants/me"),
    properties: () => c.get<Property[]>("/properties"), createProperty: (body: PropertyCreate) => c.post<Property>("/properties", body), property: (pid: string) => c.get<Property>(`/properties/${id(pid)}`),
    units: (pid: string) => c.get<Unit[]>(`/properties/${id(pid)}/units`),
    createUnit: (pid: string, body: UnitCreate) => c.post<Unit>(`/properties/${id(pid)}/units`, body),
    unit: (uid: string) => c.get<Unit>(`/units/${id(uid)}`), patchUnit: (uid: string, body: UnitPatch) => c.patch<Unit>(`/units/${id(uid)}`, body),
    tenants: () => c.get<Tenant[]>("/tenants"), tenant: (tid: string) => c.get<Tenant>(`/tenants/${id(tid)}`), createTenant: (body: TenantCreate) => c.post<Tenant>("/tenants", body),
    invoices: () => c.get<Invoice[]>("/invoices"), invoice: (iid: string) => c.get<Invoice>(`/invoices/${id(iid)}`), createInvoice: (body: InvoiceCreate) => c.post<Invoice>("/invoices", body),
    payments: () => c.get<Payment[]>("/payments"), payment: (pid: string) => c.get<Payment>(`/payments/${id(pid)}`),
    paymentAllocations: (pid: string) => c.get<Allocation[]>(`/payments/${id(pid)}/allocations`), paymentCredits: (pid: string) => c.get<Credit[]>(`/payments/${id(pid)}/credits`),
    unassignedPayments: () => c.get<UnassignedPayment[]>("/unassigned-payments"), resolveUnassigned: (pid: string, body: ResolveUnassigned) => c.post<Resolution>(`/unassigned-payments/${id(pid)}/resolve`, body),
    ledger: (limit = PAGINATION.defaultLimit, offset = 0, filters: Query = {}): Promise<Page<LedgerEntry>> => c.get<Page<LedgerEntry>>("/ledger", { query: { ...filters, limit, offset } }),
    ledgerEntry: (eid: string) => c.get<LedgerEntry>(`/ledger/${id(eid)}`),
  };
}
export type Endpoints = ReturnType<typeof createEndpoints>;
