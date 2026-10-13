"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api/errors";
import type { Endpoints } from "@/lib/api/endpoints";

export function AddProperty(props: { api: Endpoints; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await props.api.createProperty({
        name: String(form.get("name")).trim(),
        county: String(form.get("county")).trim(),
        town_location: String(form.get("town_location")).trim() || null,
        total_units: Number(form.get("total_units")),
      });
      formElement.reset();
      setOpen(false);
      props.onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add property. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="btn btn-primary" onClick={() => { setOpen((value) => !value); setError(""); }}>
      {open ? "Cancel" : "Create Properties"}
    </button>
    {open && <section className="panel section" aria-labelledby="add-property-title">
      <h2 id="add-property-title">Add property</h2>
      <p className="muted">Add the property details. You can add its individual units afterward.</p>
      <form className="form" onSubmit={submit}>
        <div className="field"><label htmlFor="property-name">Property name *</label><input id="property-name" name="name" required maxLength={255} autoComplete="organization" /></div>
        <div className="field"><label htmlFor="property-county">County *</label><input id="property-county" name="county" required maxLength={100} /></div>
        <div className="field"><label htmlFor="property-town">Town or area</label><input id="property-town" name="town_location" maxLength={255} /></div>
        <div className="field"><label htmlFor="property-units">Number of units *</label><input id="property-units" name="total_units" type="number" min={1} step={1} required /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Adding…" : "Save property"}</button>
      </form>
    </section>}
  </>;
}
