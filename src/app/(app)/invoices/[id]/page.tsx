"use client";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>(); const { api } = useReadyAuth(); const { state, reload } = useLoad(() => api.invoice(id), [api, id]);
  return <RoleGate roles={["LANDLORD"]}><PageHeader title="Invoice" back={{ href: "/invoices", label: "Invoices" }} /><DataState state={state} onRetry={reload}>{(i) => <div className="panel"><ResourceDetails title={i.invoice_number} fields={[{ label: "Billing month", value: i.billing_month }, { label: "Tenant ID", value: i.tenant_id }, { label: "Unit ID", value: i.unit_id }, { label: "Rent", value: <Money value={i.rent_amount} /> }, { label: "Water", value: <Money value={i.water_amount} /> }, { label: "Garbage", value: <Money value={i.garbage_amount} /> }, { label: "Security", value: <Money value={i.security_amount} /> }, { label: "Total", value: <Money value={i.total_amount} /> }, { label: "Due date", value: i.due_date }, { label: "Paid", value: i.is_paid ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={i.created_at} /> }]} /></div>}</DataState></RoleGate>;
}
