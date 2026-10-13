"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { TENANT_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";
import { useLoad } from "@/hooks/useLoad";
import { DataState } from "@/components/DataState";
import Link from "next/link";

export default function NewTenantPage() {
  const { api } = useReadyAuth();
  const router = useRouter();
  const units = useLoad(async () => {
    const properties = await api.properties();
    const grouped = await Promise.all(properties.map(async (property) =>
      (await api.units(property.id)).map((unit) => ({
        value: unit.id,
        label: `${property.name} · ${unit.unit_number}`,
      })),
    ));
    return grouped.flat();
  }, [api]);
  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Add tenant" back={{ href: "/tenants", label: "Tenants" }} />
      <DataState state={units.state} onRetry={units.reload} isEmpty={(options) => options.length === 0} emptyTitle="No units available" emptyHint="Add a unit to one of your properties before adding a tenant.">
        {(options) => <div className="panel">
          <ResourceForm
            specs={TENANT_CREATE_FIELDS}
            options={{ unit_id: options }}
            submitLabel="Create tenant"
            onSubmit={async (payload) => {
              const created = await api.createTenant({ unit_id: payload.unit_id ?? "", full_name: payload.full_name ?? "", primary_phone: payload.primary_phone ?? "", lease_start_date: payload.lease_start_date ?? "", ...(payload.deposit_amount ? { deposit_amount: payload.deposit_amount } : {}), ...(payload.id_number ? { id_number: payload.id_number } : {}) });
              router.push(`/tenants/${encodeURIComponent(created.id)}`);
            }}
          />
        </div>}
      </DataState>
      {units.state.status === "success" && units.state.data.length === 0 && <p className="muted">Go to <Link href="/properties">Properties</Link> to add a unit.</p>}
    </RoleGate>
  );
}
