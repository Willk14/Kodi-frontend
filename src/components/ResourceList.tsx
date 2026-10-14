"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useLoad, type LoadState } from "@/hooks/useLoad";
import { DataState } from "./DataState";
import { DataTable, type Column } from "./DataTable";
import { PageHeader } from "./PageHeader";

export function ResourceList<T extends object & { id: string }>(props: {
  title: string; description?: string; load: () => Promise<T[]>; basePath: string;
  emptyTitle: string; emptyHint?: string; create?: ReactNode;
  columns: Column<T>[]; detail?: (row: T) => ReactNode; extra?: ReactNode;
  filterRows?: (rows: T[]) => T[];
}) {
  const { state, reload } = useLoad(props.load, []);
  const path = usePathname() ?? props.basePath;
  const [selected, setSelected] = useState("");
  useEffect(() => {
    const read = () => setSelected(new URLSearchParams(window.location.search).get("selected") ?? "");
    read(); window.addEventListener("popstate", read); return () => window.removeEventListener("popstate", read);
  }, []);
  const select = (id: string) => {
    setSelected(id);
    const query = new URLSearchParams(window.location.search); query.set("selected", id);
    window.history.replaceState(null, "", `${path}?${query.toString()}`);
  };
  return <>
    <PageHeader title={props.title} description={props.description} action={props.create} />
    {props.extra}
    <DataState state={state} onRetry={reload} isEmpty={(rows) => rows.length === 0} emptyTitle={props.emptyTitle} emptyHint={props.emptyHint}>
      {(rows) => {
        const visibleRows = props.filterRows?.(rows) ?? rows;
        const current = visibleRows.find((r) => r.id === selected);
        if (visibleRows.length === 0) return <p className="muted" role="status">No {props.title.toLowerCase()} match this property.</p>;
        return props.detail ? <div className="master-detail">
          <div className="master-list"><DataTable rows={visibleRows} columns={props.columns} caption={props.title} hrefFor={(row) => `${props.basePath}/${encodeURIComponent(row.id)}`} onSelect={(row) => select(row.id)} /></div>
          <aside className="detail-panel" aria-label={`${props.title} details`}>
            {current ? props.detail(current) : <p className="muted">Select a record to see its details.</p>}
          </aside>
        </div> : <DataTable rows={visibleRows} columns={props.columns} caption={props.title} hrefFor={(row) => `${props.basePath}/${encodeURIComponent(row.id)}`} />;
      }}
    </DataState>
  </>;
}

export function InlineTable<T extends object & { id: string }>(props: {
  title: string; state: LoadState<T[]>; onRetry: () => void; emptyTitle: string;
  columns: Column<T>[]; basePath?: string;
}) {
  return <section className="section" aria-labelledby={`h-${props.title}`}><h2 id={`h-${props.title}`}>{props.title}</h2>
    <DataState state={props.state} onRetry={props.onRetry} isEmpty={(r) => r.length === 0} emptyTitle={props.emptyTitle}>
      {(rows) => <DataTable rows={rows} columns={props.columns} caption={props.title} hrefFor={props.basePath ? (r) => `${props.basePath}/${encodeURIComponent(r.id)}` : undefined} />}
    </DataState>
  </section>;
}
