"use client";

import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import { mapProperty } from "@/lib/api/view-models";
import { DateTimeEAT } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";
import { AddProperty } from "@/components/AddProperty";
import { useState } from "react";

export default function PropertiesPage() {
  const { api } = useReadyAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <RoleGate roles={["LANDLORD"]}>
      <ResourceList
        key={refreshKey}
        title="Properties"
        description="Manage your rental properties and their units."
        create={<AddProperty api={api} onCreated={() => setRefreshKey((value) => value + 1)} />}
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
