"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/session";
import type { Role } from "@/lib/api/types";

export function Capability(props: { roles: Role[]; supported: boolean; reason: string; children: ReactNode; disabledLabel?: string }) {
  const { state } = useAuth();
  const allowed = state.status === "ready" && props.roles.includes(state.role) && props.supported;
  if (allowed) return <>{props.children}</>;
  const roleReason = state.status === "ready" && !props.roles.includes(state.role) ? `Not available for ${state.role.toLowerCase()}s` : props.reason;
  return <span className="capability-disabled"><button type="button" className="btn" disabled aria-disabled="true">{props.disabledLabel ?? "Unavailable"}</button><span className="capability-reason">{roleReason}</span></span>;
}
