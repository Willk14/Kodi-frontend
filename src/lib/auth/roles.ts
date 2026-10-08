import type { Role } from "@/lib/api/types";

export interface NavItem {
  href: string;
  label: string;
  roles: Role[];
}

/**
 * UX navigation only. Backend authorization is authoritative: hiding a link
 * is never a permission check.
 * CARETAKER has unit and tenant reads, but the properties route is landlord-only.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", roles: ["LANDLORD", "CARETAKER", "TENANT"] },
  { href: "/properties", label: "Properties", roles: ["LANDLORD"] },
  { href: "/tenants", label: "Tenants", roles: ["LANDLORD", "CARETAKER"] },
  { href: "/invoices", label: "Invoices", roles: ["LANDLORD"] },
  { href: "/payments", label: "Payments", roles: ["LANDLORD", "TENANT"] },
  { href: "/unassigned-payments", label: "Unassigned", roles: ["LANDLORD"] },
  { href: "/ledger", label: "Ledger", roles: ["LANDLORD"] },
];

export const navFor = (role: Role): NavItem[] => NAV_ITEMS.filter((i) => i.roles.includes(role));
export const can = (role: Role, allowed: Role[]) => allowed.includes(role);
