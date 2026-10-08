"use client";

import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import Link from "next/link";
import { Capability } from "@/components/Capability";
import { DateTimeEAT, Money } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";
import { mapInvoice } from "@/lib/api/view-models";

export default function InvoicesPage() {
  const { api } = useReadyAuth();
  return (
    <RoleGate roles={["LANDLORD"]}>
      <ResourceList
        title="Invoices"
        description="Create and read invoices. Editing and deletion are not supported by the backend."
        load={async () => (await api.invoices()).map(mapInvoice)}
        basePath="/invoices"
        emptyTitle="No invoices"
        create={<Capability roles={["LANDLORD"]} supported reason="Invoice creation is not supported by the backend."><Link href="/invoices/new" className="btn btn-primary">Create invoice</Link></Capability>}
        columns={[{ key: "invoiceNumber", label: "Invoice" }, { key: "billingMonth", label: "Billing month" }, { key: "totalAmount", label: "Total", kind: "money" }, { key: "dueDate", label: "Due date" }, { key: "paid", label: "Paid", kind: "boolean" }]}
        detail={(i) => <ResourceDetails title={i.invoiceNumber} fields={[{ label: "Billing month", value: i.billingMonth }, { label: "Tenant ID", value: i.tenantId }, { label: "Unit ID", value: i.unitId }, { label: "Rent", value: <Money value={i.rentAmount} /> }, { label: "Water", value: <Money value={i.waterAmount} /> }, { label: "Garbage", value: <Money value={i.garbageAmount} /> }, { label: "Security", value: <Money value={i.securityAmount} /> }, { label: "Total", value: <Money value={i.totalAmount} /> }, { label: "Due date", value: i.dueDate }, { label: "Paid", value: i.paid ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={i.createdAt} /> }]} />}
      />
    </RoleGate>
  );
}
