"use client";

import { useState } from "react";
import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import Link from "next/link";
import { Capability } from "@/components/Capability";
import { DateTimeEAT, Money, PhoneNumber } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";
import { mapTenant } from "@/lib/api/view-models";
import { useLoad } from "@/hooks/useLoad";

export default function TenantsPage() {
  const { api } = useReadyAuth();
  const [propertyId, setPropertyId] = useState("");
  const directory = useLoad(() => api.properties(), [api]);
  const properties = directory.state.status === "success" ? directory.state.data : [];
  return (
    <RoleGate roles={["LANDLORD", "CARETAKER"]}>
      <ResourceList
        title="Tenants"
        description="Tenant edit and delete are not available in the backend yet."
        load={async () => {
          const tenants = await api.tenants();
          const propertyList = await api.properties();
          const unitGroups = await Promise.all(propertyList.map(async (property) => ({
            propertyId: property.id,
            units: await api.units(property.id),
          })));
          const propertyByUnit = new Map(unitGroups.flatMap(({ propertyId: id, units }) => units.map((unit) => [unit.id, id] as const)));
          return tenants.map((tenant) => ({ ...mapTenant(tenant), propertyId: propertyByUnit.get(tenant.unit_id) ?? "" }));
        }}
        basePath="/tenants"
        emptyTitle="No tenants"
        create={<Capability roles={["LANDLORD"]} supported reason="Tenant creation is unavailable."><Link href="/tenants/new" className="btn btn-primary">Add tenant</Link></Capability>}
        extra={<div className="field tenant-property-filter"><label htmlFor="tenant-property">Property</label><select id="tenant-property" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}><option value="">All properties</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}{property.town_location ? ` · ${property.town_location}` : ""}</option>)}</select></div>}
        filterRows={(rows) => propertyId ? rows.filter((tenant) => tenant.propertyId === propertyId) : rows}
        columns={[{ key: "fullName", label: "Tenant" }, { key: "primaryPhone", label: "Phone", kind: "phone" }, { key: "leaseStartDate", label: "Lease starts" }, { key: "active", label: "Active", kind: "boolean" }]}
        detail={(t) => <ResourceDetails title={t.fullName} fields={[{ label: "Phone", value: <PhoneNumber value={t.primaryPhone} /> }, { label: "Unit ID", value: <Link href={`/units/${encodeURIComponent(t.unitId)}`}>View unit</Link> }, { label: "Lease starts", value: t.leaseStartDate }, { label: "Deposit", value: <Money value={t.depositAmount} /> }, { label: "Active", value: t.active ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={t.createdAt} /> }]} />}
      />
    </RoleGate>
  );
}
