import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader(props: { title: string; description?: string; back?: { href: string; label: string }; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        {props.back && (
          <Link href={props.back.href} className="back-link">
            ← {props.back.label}
          </Link>
        )}
        <h1>{props.title}</h1>
        {props.description && <p className="muted">{props.description}</p>}
      </div>
      {props.action && <div className="page-action">{props.action}</div>}
    </header>
  );
}
