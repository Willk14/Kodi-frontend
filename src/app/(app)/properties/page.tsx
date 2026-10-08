"use client";

import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import { mapProperty } from "@/lib/api/view-models";
import { DateTimeEAT } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";

export default function PropertiesPage() {
  const { api } = useReadyAuth();
  return (
    <RoleGate roles={["LANDLORD"]}>
      <ResourceList
        title="Properties"
        description="Properties are read-only in the current API."
        load={async () => (await api.properties()).map(mapProperty)}
        basePath="/properties"
        emptyTitle="No properties"
        emptyHint="No properties are visible to your account."
        columns={[{ key: "name", label: "Property" }, { key: "location", label: "Location" }, { key: "totalUnits", label: "Units" }, { key: "createdAt", label: "Created", kind: "datetime" }]}
        detail={(p) => <ResourceDetails title={p.name} fields={[{ label: "Location", value: p.location }, { label: "Total units", value: p.totalUnits }, { label: "Created", value: <DateTimeEAT value={p.createdAt} /> }]} />}
      />
    </RoleGate>
  );
}
