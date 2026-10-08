"use client";

import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import { DateTimeEAT, Money, ReceiptCode } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";
import { mapPayment } from "@/lib/api/view-models";

export default function PaymentsPage() {
  const { api } = useReadyAuth();
  return (
    <RoleGate roles={["LANDLORD", "TENANT"]}>
      <ResourceList
        title="Payments"
        description="Payment history. M-Pesa STK Push initiation is not available from this app."
        load={async () => (await api.payments()).map(mapPayment)}
        basePath="/payments"
        emptyTitle="No payments yet"
        columns={[{ key: "receipt", label: "Receipt", kind: "receipt" }, { key: "amount", label: "Amount", kind: "money" }, { key: "method", label: "Method" }, { key: "status", label: "Status", kind: "status" }, { key: "createdAt", label: "Created", kind: "datetime" }]}
        detail={(p) => <ResourceDetails title="Payment" fields={[{ label: "Receipt", value: <ReceiptCode value={p.receipt} /> }, { label: "Amount", value: <Money value={p.amount} /> }, { label: "Method", value: p.method }, { label: "Status", value: p.status }, { label: "Tenant ID", value: p.tenantId }, { label: "Created", value: <DateTimeEAT value={p.createdAt} /> }, { label: "Completed", value: <DateTimeEAT value={p.completedAt} /> }]} />}
      />
    </RoleGate>
  );
}
