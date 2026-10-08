"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ResourceForm } from "@/components/ResourceForm";
import { RoleGate } from "@/components/RoleGate";
import { TENANT_CREATE_FIELDS } from "@/lib/api/contract";
import { useReadyAuth } from "@/lib/auth/session";

export default function NewTenantPage() {
  const { api } = useReadyAuth();
  const router = useRouter();
  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Add tenant" back={{ href: "/tenants", label: "Tenants" }} />
      <div className="panel">
        <ResourceForm
          specs={TENANT_CREATE_FIELDS}
          submitLabel="Create tenant"
          onSubmit={async (payload) => {
            const created = await api.createTenant({ unit_id: payload.unit_id ?? "", full_name: payload.full_name ?? "", primary_phone: payload.primary_phone ?? "", lease_start_date: payload.lease_start_date ?? "", ...(payload.deposit_amount ? { deposit_amount: payload.deposit_amount } : {}), ...(payload.id_number ? { id_number: payload.id_number } : {}) });
            router.push(`/tenants/${encodeURIComponent(created.id)}`);
          }}
        />
      </div>
    </RoleGate>
  );
}
