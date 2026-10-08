"use client";

import Link from "next/link";
import { PhoneNumber } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { Unavailable } from "@/components/RoleGate";
import { DataState } from "@/components/DataState";
import { useLoad } from "@/hooks/useLoad";
import { navFor } from "@/lib/auth/roles";
import { useReadyAuth } from "@/lib/auth/session";

function QuickLinks() {
  const { role } = useReadyAuth();
  return (
    <nav aria-label="Quick links" className="grid">
      {navFor(role)
        .filter((i) => i.href !== "/")
        .map((i) => (
          <Link key={i.href} href={i.href} className="panel link-card">
            {i.label} →
          </Link>
        ))}
    </nav>
  );
}

function AccountSummary() {
  const { role, context } = useReadyAuth();
  if (role === "LANDLORD" && "property_count" in context) return <dl className="kv"><div className="kv-row"><dt>Role</dt><dd>Landlord</dd></div><div className="kv-row"><dt>Properties</dt><dd>{context.property_count}</dd></div></dl>;
  if (role === "CARETAKER") return <p className="muted">Signed in as a caretaker. Property scope is resolved by the backend.</p>;
  if ("full_name" in context) return <dl className="kv"><div className="kv-row"><dt>Name</dt><dd>{context.full_name}</dd></div><div className="kv-row"><dt>Phone</dt><dd><PhoneNumber value={context.primary_phone} /></dd></div><div className="kv-row"><dt>Lease start</dt><dd>{context.lease_start_date}</dd></div></dl>;
  return <p className="muted">Account context is available.</p>;
}

function LandlordHome() {
  const { api } = useReadyAuth();
  const { state, reload } = useLoad(() => api.properties(), [api]);
  return (
    <>
      <PageHeader title="Landlord home" description="Overview assembled from the routes the backend provides." />
      <div className="grid">
        <div className="panel metric">
          <span className="label">Properties</span>
          <DataState state={state} onRetry={reload}>
            {(rows) => <span className="metric-value">{rows.length}</span>}
          </DataState>
        </div>
        <Unavailable title="Rent collected" reason="No dashboard endpoint exists yet." />
        <Unavailable title="Arrears" reason="No dashboard endpoint exists yet." />
        <Unavailable title="Occupancy" reason="No dashboard endpoint exists yet." />
      </div>
      <section className="section">
        <h2>Account context</h2>
        <div className="panel">
          <AccountSummary />
        </div>
      </section>
      <section className="section">
        <h2>Go to</h2>
        <QuickLinks />
      </section>
    </>
  );
}

function CaretakerHome() {
  return (
    <>
      <PageHeader title="Caretaker home" description="You can view units and tenants. Financial workflows are not available to caretakers." />
      <div className="panel">
        <AccountSummary />
      </div>
      <section className="section">
        <h2>Go to</h2>
        <QuickLinks />
      </section>
    </>
  );
}

function TenantHome() {
  return (
    <>
      <PageHeader title="My profile" description="Your tenant record. Invoice self-service is not available yet." />
      <div className="panel">
        <AccountSummary />
      </div>
      <section className="section">
        <h2>Go to</h2>
        <QuickLinks />
      </section>
    </>
  );
}

export default function HomePage() {
  const { role } = useReadyAuth();
  if (role === "LANDLORD") return <LandlordHome />;
  if (role === "CARETAKER") return <CaretakerHome />;
  return <TenantHome />;
}
