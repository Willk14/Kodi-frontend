import Link from "next/link";
import { DateTimeEAT, Money, PhoneNumber, ReceiptCode } from "./DesignSystem";
import { StatusBadge } from "./StatusBadge";

export interface Column<T extends object> { key: keyof T; label: string; kind?: "money" | "status" | "phone" | "receipt" | "datetime" | "boolean" }
export function DataTable<T extends object & { id: string }>(props: {
  rows: T[]; columns: Column<T>[]; hrefFor?: (row: T) => string | null; caption: string; onSelect?: (row: T) => void;
}) {
  return <div className="table-wrap" tabIndex={0} role="region" aria-label={props.caption}>
    <table className="table"><caption className="sr-only">{props.caption}</caption>
      <thead><tr>{props.columns.map((c) => <th key={String(c.key)} scope="col">{c.label}</th>)}{(props.hrefFor || props.onSelect) && <th scope="col"><span className="sr-only">Open</span></th>}</tr></thead>
      <tbody>{props.rows.map((row) => {
        const href = props.hrefFor?.(row) ?? null;
        return <tr key={row.id}>{props.columns.map((c) => {
          const value = row[c.key];
          return <td key={String(c.key)} data-label={c.label}>
            {c.kind === "money" && typeof value === "string" ? <Money value={value} /> :
             c.kind === "status" && typeof value === "string" ? <StatusBadge status={value} /> :
             c.kind === "phone" && typeof value === "string" ? <PhoneNumber value={value} /> :
             c.kind === "receipt" && (typeof value === "string" || value === null) ? <ReceiptCode value={value as string | null} /> :
             c.kind === "datetime" && (typeof value === "string" || value === null) ? <DateTimeEAT value={value as string | null} /> :
             c.kind === "boolean" && typeof value === "boolean" ? (value ? "Yes" : "No") :
             value === null || value === undefined || value === "" ? "—" : String(value)}
          </td>;
        })}{(props.hrefFor || props.onSelect) && <td data-label="">{props.onSelect && <button type="button" className="row-link master-select" onClick={() => props.onSelect?.(row)}>Select</button>} {href && <Link href={href} className="row-link">Open</Link>}</td>}</tr>;
      })}</tbody>
    </table>
  </div>;
}
