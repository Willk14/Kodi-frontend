"use client";
import { useParams } from "next/navigation";
import { Capability } from "@/components/Capability";
import { DataState } from "@/components/DataState";
import { DateTimeEAT } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { ResourceForm } from "@/components/ResourceForm";
import { InlineTable } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { UNIT_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";
import { mapUnit } from "@/lib/api/view-models";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { api } = useReadyAuth();
  const property = useLoad(() => api.property(id), [api, id]);
  const units = useLoad(async () => (await api.units(id)).map(mapUnit), [api, id]);
  return <RoleGate roles={["LANDLORD"]}>
    <PageHeader title="Property" back={{ href: "/properties", label: "Properties" }} />
    <DataState state={property.state} onRetry={property.reload}>{(p) => <div className="panel"><ResourceDetails title={p.name} fields={[{ label: "County", value: p.county }, { label: "Town", value: p.town_location }, { label: "Total units", value: p.total_units }, { label: "Created", value: <DateTimeEAT value={p.created_at} /> }]} /></div>}</DataState>
    <InlineTable title="Units" state={units.state} onRetry={units.reload} emptyTitle="No units in this property" basePath="/units" columns={[{ key: "unitNumber", label: "Unit" }, { key: "baseRent", label: "Base rent", kind: "money" }, { key: "occupied", label: "Occupied", kind: "boolean" }]} />
    <section className="section"><h2>Add a unit</h2><div className="panel"><Capability roles={["LANDLORD"]} supported reason="Unit creation is not supported by the backend."><ResourceForm specs={UNIT_CREATE_FIELDS} submitLabel="Create unit" successMessage="Unit created." onSubmit={async (payload) => {
      await api.createUnit(id, { unit_number: payload.unit_number ?? "", base_rent: payload.base_rent ?? "", ...(payload.garbage_fee ? { garbage_fee: payload.garbage_fee } : {}), ...(payload.security_fee ? { security_fee: payload.security_fee } : {}), ...(payload.water_rate_per_unit ? { water_rate_per_unit: payload.water_rate_per_unit } : {}) });
      units.reload();
    }} /></Capability></div><p className="muted">Unit delete is not available in the backend.</p></section>
  </RoleGate>;
}
