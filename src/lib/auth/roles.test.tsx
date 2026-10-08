import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Nav } from "@/components/Nav";
import { navFor } from "./roles";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const labels = (role: Parameters<typeof navFor>[0]) => navFor(role).map((i) => i.label);

describe("role-aware navigation", () => {
  it("gives landlords every supported area", () => {
    expect(labels("LANDLORD")).toEqual(["Home", "Properties", "Tenants", "Invoices", "Payments", "Unassigned", "Ledger"]);
  });
  it("keeps caretakers out of financial areas", () => {
    const l = labels("CARETAKER");
    for (const forbidden of ["Invoices", "Payments", "Unassigned", "Ledger"]) expect(l).not.toContain(forbidden);
  });
  it("limits tenants to home and payments", () => {
    expect(labels("TENANT")).toEqual(["Home", "Payments"]);
  });
  it("renders links for the role and marks the current page", () => {
    render(<Nav role="TENANT" pathname="/payments/abc" variant="side" />);
    expect(screen.queryByRole("link", { name: "Ledger" })).toBeNull();
    expect(screen.getByRole("link", { name: "Payments" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });
});
