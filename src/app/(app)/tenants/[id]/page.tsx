"use client";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money, PhoneNumber } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
import Link from "next/link";
export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>(); const { api } = useReadyAuth(); const { state, reload } = useLoad(() => api.tenant(id), [api, id]);
  return <RoleGate roles={["LANDLORD", "CARETAKER"]}><PageHeader title="Tenant" back={{ href: "/tenants", label: "Tenants" }} /><DataState state={state} onRetry={reload}>{(t) => <div className="panel"><ResourceDetails title={t.full_name} fields={[{ label: "Phone", value: <PhoneNumber value={t.primary_phone} /> }, { label: "Unit", value: <Link href={`/units/${encodeURIComponent(t.unit_id)}`}>View unit</Link> }, { label: "Lease start", value: t.lease_start_date }, { label: "Deposit", value: <Money value={t.deposit_amount} /> }, { label: "Active", value: t.is_active ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={t.created_at} /> }]} /></div>}</DataState></RoleGate>;
}
