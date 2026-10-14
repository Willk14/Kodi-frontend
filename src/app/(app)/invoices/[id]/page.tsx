"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { api } = useReadyAuth();
  const { state, reload } = useLoad(async () => {
    const invoice = await api.invoice(id);
    const tenant = await api.tenant(invoice.tenant_id);
    return { invoice, tenant };
  }, [api, id]);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function initiateStkPush(defaultPhone: string) {
    const phoneToUse = phone.trim() || defaultPhone;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await api.initiateInvoiceStkPush(id, phoneToUse);
      setPhone(phoneToUse);
      setMessage(response.CustomerMessage || "STK Push requested. Ask the tenant to enter their M-Pesa PIN on their phone.");
    } catch (err) {
      setError(err instanceof ApiError && typeof err.detail === "string" ? err.detail : "Could not initiate the STK Push. Check the phone number and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <RoleGate roles={["LANDLORD"]}>
      <PageHeader title="Invoice" back={{ href: "/invoices", label: "Invoices" }} />
      <DataState state={state} onRetry={reload}>
        {({ invoice, tenant }) => <>
          <div className="panel">
            <ResourceDetails title={invoice.invoice_number} fields={[
              { label: "Billing month", value: invoice.billing_month },
              { label: "Tenant ID", value: invoice.tenant_id },
              { label: "Unit ID", value: invoice.unit_id },
              { label: "Rent", value: <Money value={invoice.rent_amount} /> },
              { label: "Water", value: <Money value={invoice.water_amount} /> },
              { label: "Garbage", value: <Money value={invoice.garbage_amount} /> },
              { label: "Security", value: <Money value={invoice.security_amount} /> },
              { label: "Total", value: <Money value={invoice.total_amount} /> },
              { label: "Due date", value: invoice.due_date },
              { label: "Paid", value: invoice.is_paid ? "Yes" : "No" },
              { label: "Created", value: <DateTimeEAT value={invoice.created_at} /> },
            ]} />
          </div>
          {!invoice.is_paid && <section className="section">
            <h2>Request M-Pesa payment</h2>
            <div className="panel form">
              <p className="muted">Send an STK Push for this invoice’s outstanding whole-shilling balance.</p>
              <div className="field">
                <label htmlFor="stk-phone">Tenant phone (254XXXXXXXXX)</label>
                <input id="stk-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="254712345678" value={phone || tenant.primary_phone} onChange={(event) => setPhone(event.target.value)} />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="form-success" role="status">{message}</p>}
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => initiateStkPush(tenant.primary_phone)}>{busy ? "Sending…" : "Send STK Push"}</button>
            </div>
          </section>}
        </>}
      </DataState>
    </RoleGate>
  );
}
