import type { ReactNode } from "react";

export function ResourceDetails({ title, fields, children }: { title: string; fields: { label: string; value: ReactNode }[]; children?: ReactNode }) {
  return <section aria-label={title}><h2>{title}</h2><dl className="kv">{fields.map((field) => <div className="kv-row" key={field.label}><dt>{field.label}</dt><dd>{field.value ?? "—"}</dd></div>)}</dl>{children}</section>;
}
