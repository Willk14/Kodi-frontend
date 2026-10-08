"use client";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { UNIT_PATCH_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";

export default function UnitDetailPage() {
  const { id } = useParams<{ id: string }>(); const { api, role } = useReadyAuth();
  const { state, reload } = useLoad(() => api.unit(id), [api, id]);
  return <RoleGate roles={["LANDLORD", "CARETAKER"]}><PageHeader title="Unit" back={{ href: role === "LANDLORD" ? "/properties" : "/tenants", label: role === "LANDLORD" ? "Properties" : "Tenants" }} />
    <DataState state={state} onRetry={reload}>{(unit) => <>
      <div className="panel"><ResourceDetails title={unit.unit_number} fields={[{ label: "Property ID", value: unit.property_id }, { label: "Base rent", value: <Money value={unit.base_rent} /> }, { label: "Garbage fee", value: <Money value={unit.garbage_fee} /> }, { label: "Security fee", value: <Money value={unit.security_fee} /> }, { label: "Water rate per unit", value: <Money value={unit.water_rate_per_unit} /> }, { label: "Occupied", value: unit.is_occupied ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={unit.created_at} /> }]} /></div>
      {role === "LANDLORD" && <section className="section"><h2>Edit unit</h2><div className="panel"><ResourceForm patch specs={UNIT_PATCH_FIELDS} initial={{ unit_number: unit.unit_number, base_rent: unit.base_rent, garbage_fee: unit.garbage_fee, security_fee: unit.security_fee, water_rate_per_unit: unit.water_rate_per_unit }} submitLabel="Save changes" successMessage="Unit updated." onSubmit={async (p) => { await api.patchUnit(id, { ...(p.unit_number ? { unit_number: p.unit_number } : {}), ...(p.base_rent ? { base_rent: p.base_rent } : {}), ...(p.garbage_fee ? { garbage_fee: p.garbage_fee } : {}), ...(p.security_fee ? { security_fee: p.security_fee } : {}), ...(p.water_rate_per_unit ? { water_rate_per_unit: p.water_rate_per_unit } : {}) }); reload(); }} /></div></section>}
    </>}</DataState>
  </RoleGate>;
}
