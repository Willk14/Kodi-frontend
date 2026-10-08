"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/session";
import type { Role } from "@/lib/api/types";

/** UX gate only - the backend still authorizes every request. */
export function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { state } = useAuth();
  if (state.status !== "ready") return null;
  if (!roles.includes(state.role)) {
    return (
      <div className="panel panel-empty">
        <strong>Not available for your role</strong>
        <p className="muted">This page is not part of the {state.role.toLowerCase()} workspace.</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function Unavailable({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="panel unavailable" aria-disabled="true">
      <strong>{title}</strong>
      <p className="muted">{reason}</p>
    </div>
  );
}
