import { ApiError } from "@/lib/api/errors";
import type { Endpoints } from "@/lib/api/endpoints";
import type { MembershipContext, Role } from "@/lib/api/types";

export interface Membership {
  role: Role;
  context: MembershipContext;
}

/**
 * The backend has no "whoami" route, so the role is discovered by asking each
 * role-scoped route in turn. 403/404 mean "not this role"; the backend remains
 * the authority (it resolves exactly one active membership per identity).
 * 401 and server/network errors are rethrown for the caller to handle.
 * Returns null when no role route accepts the identity (no membership).
 */
export async function resolveMembership(ep: Pick<Endpoints, "landlordMe" | "caretakerMe" | "tenantMe">): Promise<Membership | null> {
  const probes: [Role, () => Promise<MembershipContext>][] = [
    ["LANDLORD", ep.landlordMe],
    ["CARETAKER", ep.caretakerMe],
    ["TENANT", ep.tenantMe],
  ];
  for (const [role, probe] of probes) {
    try {
      return { role, context: await probe() };
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) continue;
      throw err;
    }
  }
  return null;
}
