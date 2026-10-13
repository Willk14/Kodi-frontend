"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DataState } from "@/components/DataState";
import { PageHeader } from "@/components/PageHeader";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { TENANT_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";

export default function NewTenantPage() {
  const { api } = useReadyAuth();
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const properties = useLoad(async () => {
    const properties = await api.properties();
    return Promise.all(properties.map(async (property) => ({
      ...property,
      units: (await api.units(property.id)).map((unit) => ({
        value: unit.id,
        label: unit.unit_number,
      })),
    })));
  }, [api]);
  const selectedProperty = properties.state.status === "success"
    ? properties.state.data.find((property) => property.id === selectedPropertyId)
    : undefined;
  const noUnits = properties.state.status === "success"
    && (properties.state.data.length === 0 || properties.state.data.every((property) => property.units.length === 0));

  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Add tenant" back={{ href: "/tenants", label: "Tenants" }} />
      <DataState
        state={properties.state}
        onRetry={properties.reload}
        isEmpty={(items) => items.length === 0 || items.every((property) => property.units.length === 0)}
        emptyTitle="No units available"
        emptyHint="Add a unit to one of your properties before adding a tenant."
      >
        {(items) => (
          <div className="panel">
            <div className="field">
              <label htmlFor="tenant-property">Choose property <span aria-hidden="true">*</span></label>
              <select
                id="tenant-property"
                value={selectedPropertyId}
                onChange={(event) => setSelectedPropertyId(event.target.value)}
                required
              >
                <option value="">Choose a property</option>
                {items.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
              </select>
            </div>
            <ResourceForm
              specs={TENANT_CREATE_FIELDS}
              options={{ unit_id: selectedProperty?.units ?? [] }}
              disabledOptions={selectedPropertyId ? [] : ["unit_id"]}
              optionPlaceholders={{ unit_id: selectedPropertyId ? "Choose a unit" : "Choose a property first" }}
              submitLabel="Create tenant"
              onSubmit={async (payload) => {
                const created = await api.createTenant({ unit_id: payload.unit_id ?? "", full_name: payload.full_name ?? "", primary_phone: payload.primary_phone ?? "", lease_start_date: payload.lease_start_date ?? "", ...(payload.deposit_amount ? { deposit_amount: payload.deposit_amount } : {}), ...(payload.id_number ? { id_number: payload.id_number } : {}) });
                router.push(`/tenants/${encodeURIComponent(created.id)}`);
              }}
            />
            {selectedProperty && selectedProperty.units.length === 0 && (
              <p className="muted">This property has no units yet. <Link href={`/properties/${encodeURIComponent(selectedProperty.id)}`}>Add a unit</Link>.</p>
            )}
          </div>
        )}
      </DataState>
      {noUnits && <p className="muted">Go to <Link href="/properties">Properties</Link> to add a unit.</p>}
    </RoleGate>
  );
}
