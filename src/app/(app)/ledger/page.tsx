"use client";
import { useState, type FormEvent } from "react";
import { DataState } from "@/components/DataState";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { PAGINATION, LEDGER_FILTERS } from "@/lib/api/contract";
import type { Query } from "@/lib/api/client";
import { useReadyAuth } from "@/lib/auth/session";
import { mapLedgerEntry } from "@/lib/api/view-models";

export default function LedgerPage() {
  const { api } = useReadyAuth(); const limit = PAGINATION.defaultLimit;
  const [offset, setOffset] = useState(0); const [draft, setDraft] = useState<Record<string, string>>({}); const [filters, setFilters] = useState<Query>({});
  const { state, reload } = useLoad(async () => { const p = await api.ledger(limit, offset, filters); return { ...p, items: p.items.map(mapLedgerEntry) }; }, [api, limit, offset, filters]);
  const submit = (event: FormEvent) => { event.preventDefault(); const next: Query = {}; for (const [key, value] of Object.entries(draft)) if (value.trim()) next[key] = value.trim(); setOffset(0); setFilters(next); };
  return <RoleGate roles={["LANDLORD"]}><PageHeader title="Ledger" description="Read-only financial history. Ledger mutations and reversals are not available." />
    <form className="filter-grid panel" onSubmit={submit} aria-label="Ledger filters">{LEDGER_FILTERS.map((f) => <label className="field" key={f.param}>{f.label}<input value={draft[f.param] ?? ""} maxLength={"maxLength" in f ? f.maxLength : undefined} placeholder={f.kind === "date" ? "2026-01-01T00:00:00+03:00" : undefined} onChange={(e) => setDraft((d) => ({ ...d, [f.param]: e.target.value }))} /></label>)}<div className="filter-actions"><button className="btn btn-primary" type="submit">Apply filters</button><button className="btn" type="button" onClick={() => { setDraft({}); setFilters({}); setOffset(0); }}>Clear</button></div></form>
    <DataState state={state} onRetry={reload} isEmpty={(p) => p.items.length === 0 && offset === 0} emptyTitle="No ledger entries">{(page) => <>
      <DataTable caption="Ledger entries" rows={page.items} columns={[{ key: "receipt", label: "Receipt", kind: "receipt" }, { key: "entryType", label: "Type" }, { key: "amount", label: "Amount", kind: "money" }, { key: "paymentMethod", label: "Method" }, { key: "status", label: "Status", kind: "status" }, { key: "createdAt", label: "Created", kind: "datetime" }]} hrefFor={(r) => `/ledger/${encodeURIComponent(r.id)}`} />
      <nav className="pager" aria-label="Ledger pagination"><button type="button" className="btn" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</button><span className="muted">{page.items.length === 0 ? "End of results" : `Showing ${offset + 1}–${offset + page.items.length} of ${page.total}`}</span><button type="button" className="btn" disabled={offset + limit >= page.total} onClick={() => setOffset(offset + limit)}>Next</button></nav>
    </>}</DataState>
  </RoleGate>;
}
