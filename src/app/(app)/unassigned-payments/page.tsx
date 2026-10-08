"use client";

import { useState } from "react";
import { AssignTenant } from "@/components/AssignTenant";
import { DataState } from "@/components/DataState";
import { Money, PhoneNumber, ReceiptCode, DateTimeEAT } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
import { mapUnassignedPayment } from "@/lib/api/view-models";
import { ResourceDetails } from "@/components/ResourceDetails";

export default function UnassignedPaymentsPage() {
  const { api } = useReadyAuth();
  const queue = useLoad(async () => (await api.unassignedPayments()).map(mapUnassignedPayment), [api]);
  const tenants = useLoad(() => api.tenants().catch(() => null), [api]);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader
        title="Unassigned payments"
        description="Payments that could not be matched to a tenant. Assignment is explicit and cannot be undone from this app."
      />
      <DataState
        state={queue.state}
        onRetry={queue.reload}
        isEmpty={(r) => r.length === 0}
        emptyTitle="Queue is clear"
        emptyHint="No payments are waiting for assignment."
      >
        {(rows) => (
          <ul className="stack" aria-label="Unassigned payments">
            {rows.map((p) => (
              <li key={p.id} className="panel panel-amber">
                <ResourceDetails title="Unassigned payment" fields={[{ label: "Receipt", value: <ReceiptCode value={p.receipt} /> }, { label: "Amount", value: <Money value={p.amount} /> }, { label: "Payer phone", value: <PhoneNumber value={p.payerPhone} /> }, { label: "Payer name", value: p.payerName }, { label: "Invalid account reference", value: p.invalidReference }, { label: "Received", value: <DateTimeEAT value={p.createdAt} /> }]} />
                {open === p.id ? (
                  <AssignTenant
                    paymentId={p.id}
                    tenants={tenants.state.status === "success" ? tenants.state.data : null}
                    onAssign={async (id, body) => {
                      await api.resolveUnassigned(id, body);
                    }}
                    onDone={() => {
                      setOpen(null);
                      queue.reload();
                    }}
                  />
                ) : (
                  <button type="button" className="btn" onClick={() => setOpen(p.id)}>
                    Assign tenant…
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </DataState>
    </RoleGate>
  );
}
