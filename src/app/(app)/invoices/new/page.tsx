"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { INVOICE_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";

export default function NewInvoicePage() {
  const { api } = useReadyAuth();
  const router = useRouter();
  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Create invoice" back={{ href: "/invoices", label: "Invoices" }} />
      <div className="panel">
        <ResourceForm
          specs={INVOICE_CREATE_FIELDS}
          submitLabel="Create invoice"
          onSubmit={async (payload) => {
            const created = await api.createInvoice({ unit_id: payload.unit_id ?? "", tenant_id: payload.tenant_id ?? "", invoice_number: payload.invoice_number ?? "", billing_month: payload.billing_month ?? "", rent_amount: payload.rent_amount ?? "", due_date: payload.due_date ?? "", ...(payload.water_amount ? { water_amount: payload.water_amount } : {}), ...(payload.garbage_amount ? { garbage_amount: payload.garbage_amount } : {}), ...(payload.security_amount ? { security_amount: payload.security_amount } : {}) });
            router.push(`/invoices/${encodeURIComponent(created.id)}`);
          }}
        />
      </div>
    </RoleGate>
  );
}
