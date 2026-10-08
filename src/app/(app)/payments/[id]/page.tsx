"use client";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money, ReceiptCode } from "@/components/DesignSystem";
import { InlineTable } from "@/components/ResourceList";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
import { mapAllocation, mapCredit } from "@/lib/api/view-models";
export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>(); const { api } = useReadyAuth();
  const payment = useLoad(() => api.payment(id), [api, id]);
  const allocations = useLoad(async () => (await api.paymentAllocations(id)).map(mapAllocation), [api, id]);
  const credits = useLoad(async () => (await api.paymentCredits(id)).map(mapCredit), [api, id]);
  return <RoleGate roles={["LANDLORD", "TENANT"]}><PageHeader title="Payment" back={{ href: "/payments", label: "Payments" }} />
    <DataState state={payment.state} onRetry={payment.reload}>{(p) => <div className="panel"><ResourceDetails title="Payment details" fields={[{ label: "Receipt", value: <ReceiptCode value={p.mpesa_receipt_number} /> }, { label: "Amount", value: <Money value={p.amount} /> }, { label: "Method", value: p.payment_method }, { label: "Status", value: p.status }, { label: "Tenant ID", value: p.tenant_id }, { label: "Created", value: <DateTimeEAT value={p.created_at} /> }, { label: "Completed", value: <DateTimeEAT value={p.completed_at} /> }]} /></div>}</DataState>
    <InlineTable title="Allocations" state={allocations.state} onRetry={allocations.reload} emptyTitle="This payment has no allocations" columns={[{ key: "invoiceId", label: "Invoice ID" }, { key: "amount", label: "Amount", kind: "money" }, { key: "status", label: "Status", kind: "status" }, { key: "createdAt", label: "Created", kind: "datetime" }, { key: "reversedAt", label: "Reversed", kind: "datetime" }]} />
    <InlineTable title="Credits" state={credits.state} onRetry={credits.reload} emptyTitle="This payment has no credits" columns={[{ key: "amount", label: "Amount", kind: "money" }, { key: "availableAmount", label: "Available", kind: "money" }, { key: "status", label: "Status", kind: "status" }, { key: "createdAt", label: "Created", kind: "datetime" }, { key: "appliedAt", label: "Applied", kind: "datetime" }]} />
  </RoleGate>;
}
