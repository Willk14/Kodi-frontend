"use client";

import { ResourceList } from "@/components/ResourceList";
import { RoleGate } from "@/components/RoleGate";
import { useReadyAuth } from "@/lib/auth/session";
import Link from "next/link";
import { Capability } from "@/components/Capability";
import { DateTimeEAT, Money, PhoneNumber } from "@/components/DesignSystem";
import { ResourceDetails } from "@/components/ResourceDetails";
import { mapTenant } from "@/lib/api/view-models";

export default function TenantsPage() {
  const { api } = useReadyAuth();
  return (
    <RoleGate roles={["LANDLORD", "CARETAKER"]}>
      <ResourceList
        title="Tenants"
        description="Tenant edit and delete are not available in the backend yet."
        load={async () => (await api.tenants()).map(mapTenant)}
        basePath="/tenants"
        emptyTitle="No tenants"
        create={<Capability roles={["LANDLORD"]} supported reason="Tenant creation is unavailable."><Link href="/tenants/new" className="btn btn-primary">Add tenant</Link></Capability>}
        columns={[{ key: "fullName", label: "Tenant" }, { key: "primaryPhone", label: "Phone", kind: "phone" }, { key: "leaseStartDate", label: "Lease starts" }, { key: "active", label: "Active", kind: "boolean" }]}
        detail={(t) => <ResourceDetails title={t.fullName} fields={[{ label: "Phone", value: <PhoneNumber value={t.primaryPhone} /> }, { label: "Unit ID", value: <Link href={`/units/${encodeURIComponent(t.unitId)}`}>View unit</Link> }, { label: "Lease starts", value: t.leaseStartDate }, { label: "Deposit", value: <Money value={t.depositAmount} /> }, { label: "Active", value: t.active ? "Yes" : "No" }, { label: "Created", value: <DateTimeEAT value={t.createdAt} /> }]} />}
      />
    </RoleGate>
  );
}
