"use client";

import { useId, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api/errors";
import { RESOLVE_TENANT_FIELD } from "@/lib/api/contract";
import type { ResolveUnassigned, Tenant } from "@/lib/api/types";
import { isUuid } from "@/lib/validation";

const tenantLabel = (t: Tenant): string => {
  return `${t.full_name} (${t.id.slice(0, 8)})`;
};

/** Explicit two-step assignment: choose tenant, then confirm. */
export function AssignTenant(props: {
  paymentId: string;
  tenants: Tenant[] | null; // null => tenant list unavailable, fall back to UUID entry
  onAssign: (paymentId: string, body: ResolveUnassigned) => Promise<void>;
  onDone: () => void;
}) {
  const uid = useId();
  const [tenantId, setTenantId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isUuid(tenantId)) {
      setError("Choose a tenant.");
      return;
    }
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await props.onAssign(props.paymentId, { [RESOLVE_TENANT_FIELD]: tenantId.trim() });
      props.onDone();
    } catch (err) {
      setConfirming(false);
      setError(
        err instanceof ApiError && err.status === 409
          ? "This payment was already resolved. Refresh the queue."
          : err instanceof Error
            ? err.message
            : "Unexpected error.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form assign" aria-busy={busy}>
      <div className="field">
        <label htmlFor={uid}>Assign to tenant</label>
        {props.tenants ? (
          <select
            id={uid}
            value={tenantId}
            onChange={(e) => {
              setTenantId(e.target.value);
              setConfirming(false);
            }}
          >
            <option value="">Select a tenant…</option>
            {props.tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {tenantLabel(t)}
              </option>
            ))}
          </select>
        ) : (
          <input id={uid} type="text" placeholder="Tenant UUID" value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
        )}
      </div>
      {confirming && (
        <p role="status" className="form-error">
          Confirm: this assigns the payment to the selected tenant.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {confirming ? "Confirm assignment" : "Assign tenant"}
      </button>
    </form>
  );
}
