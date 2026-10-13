"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { INVOICE_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";

export default function NewInvoicePage() {
  const { api } = useReadyAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<{ tenantId: string; invoiceNumber: string } | null>(null);
  const tenants = useLoad(async () => {
    const [tenantRows, properties] = await Promise.all([api.tenants(), api.properties()]);
    const units = (await Promise.all(properties.map((property) => api.units(property.id)))).flat();
    const unitsById = new Map(units.map((unit) => [unit.id, unit]));
    return tenantRows
      .filter((tenant) => tenant.is_active)
      .map((tenant) => ({ tenant, unit: unitsById.get(tenant.unit_id) }))
      .filter((row): row is { tenant: (typeof tenantRows)[number]; unit: (typeof units)[number] } => Boolean(row.unit));
  }, [api]);

  const rows = tenants.state.status === "success" ? tenants.state.data : [];
  const selected = selection ? rows.find((row) => row.tenant.id === selection.tenantId) : undefined;
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length < 2 || selection) return [];
    return rows.filter(({ tenant, unit }) =>
      tenant.full_name.toLowerCase().includes(query)
      || tenant.primary_phone.includes(query)
      || unit.unit_number.toLowerCase().includes(query),
    ).slice(0, 8);
  }, [rows, search, selection]);

  function chooseTenant(tenantId: string) {
    const row = rows.find((item) => item.tenant.id === tenantId);
    if (!row) return;
    const billingMonth = `${row.tenant.lease_start_date.slice(0, 7)}-01`;
    const invoiceNumber = `INV-${billingMonth.slice(0, 7).replace("-", "")}-${tenantId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setSelection({ tenantId, invoiceNumber });
    setSearch("");
  }

  const initial = selected && selection ? {
    tenant_id: selected.tenant.id,
    unit_id: selected.tenant.unit_id,
    invoice_number: selection.invoiceNumber,
    billing_month: `${selected.tenant.lease_start_date.slice(0, 7)}-01`,
    rent_amount: String(selected.unit.base_rent),
    due_date: selected.tenant.lease_start_date,
  } : undefined;

  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Create invoice" back={{ href: "/invoices", label: "Invoices" }} />
      <DataState
        state={tenants.state}
        onRetry={tenants.reload}
        isEmpty={(data) => data.length === 0}
        emptyTitle="No active tenants"
        emptyHint="Add a tenant with an assigned unit before creating an invoice."
      >
        {(data) => (
          <div className="panel">
            <div className="field">
              <label htmlFor="invoice-tenant-search">Search tenant</label>
              <input
                id="invoice-tenant-search"
                type="search"
                value={selected ? `${selected.tenant.full_name} · ${selected.unit.unit_number}` : search}
                onChange={(event) => {
                  setSelection(null);
                  setSearch(event.target.value);
                }}
                placeholder="Search by name, phone, or unit"
                autoComplete="off"
              />
            </div>
            {selected && (
              <p className="muted" aria-live="polite">
                Selected {selected.tenant.full_name} in unit {selected.unit.unit_number}. Rent, lease month, and due date are filled from the tenant and unit records.
              </p>
            )}
            {!selected && search.trim().length >= 2 && (
              matches.length > 0 ? (
                <ul className="stack" aria-label="Tenant search results">
                  {matches.map(({ tenant, unit }) => (
                    <li key={tenant.id}>
                      <button type="button" className="btn btn-ghost" onClick={() => chooseTenant(tenant.id)}>
                        {tenant.full_name} · {tenant.primary_phone} · Unit {unit.unit_number}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="muted" role="status">No matching tenants.</p>
            )}
            <ResourceForm
              key={selected?.tenant.id ?? "manual-invoice"}
              specs={INVOICE_CREATE_FIELDS}
              initial={initial}
              hiddenFields={selected ? ["tenant_id", "unit_id"] : []}
              submitLabel="Create invoice"
              onSubmit={async (payload) => {
                const created = await api.createInvoice({ unit_id: payload.unit_id ?? "", tenant_id: payload.tenant_id ?? "", invoice_number: payload.invoice_number ?? "", billing_month: payload.billing_month ?? "", rent_amount: payload.rent_amount ?? "", due_date: payload.due_date ?? "", ...(payload.water_amount ? { water_amount: payload.water_amount } : {}), ...(payload.garbage_amount ? { garbage_amount: payload.garbage_amount } : {}), ...(payload.security_amount ? { security_amount: payload.security_amount } : {}) });
                router.push(`/invoices/${encodeURIComponent(created.id)}`);
              }}
            />
            {data.length > 0 && <p className="muted">Selecting a tenant fills the invoice from their lease and unit. Review the details, then create the invoice.</p>}
          </div>
        )}
      </DataState>
    </RoleGate>
  );
}
