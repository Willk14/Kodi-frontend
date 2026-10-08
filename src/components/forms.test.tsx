import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { INVOICE_CREATE_FIELDS, TENANT_CREATE_FIELDS } from "@/lib/api/contract";
import { ApiError } from "@/lib/api/errors";
import { ResourceForm } from "./ResourceForm";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("ResourceForm", () => {
  it("blocks submit and shows field errors for invalid input", async () => {
    const onSubmit = vi.fn();
    render(<ResourceForm specs={TENANT_CREATE_FIELDS} submitLabel="Create" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Phone/), "0712345678");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/254XXXXXXXXX \(e\.g\./)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute("aria-invalid", "true");
  });

  it("submits a trimmed payload with decimals as strings", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ResourceForm specs={INVOICE_CREATE_FIELDS} submitLabel="Create" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Tenant ID/), UUID);
    await userEvent.type(screen.getByLabelText(/Unit ID/), UUID);
    await userEvent.type(screen.getByLabelText(/Rent amount/), "15000.00");
    await userEvent.type(screen.getByLabelText(/Invoice number/), "TEST-INVOICE");
    await userEvent.type(screen.getByLabelText(/Billing month/), "2026-11-01");
    await userEvent.type(screen.getByLabelText(/Due date/), "2026-11-05");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ unit_id: UUID, tenant_id: UUID, invoice_number: "TEST-INVOICE", billing_month: "2026-11-01", rent_amount: "15000.00", due_date: "2026-11-05" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Saved.");
  });

  it("maps backend 422 field errors back onto the form", async () => {
    const detail = [{ loc: ["body", "unit_id"], msg: "unit not found", type: "x" }];
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(422, detail));
    render(<ResourceForm specs={TENANT_CREATE_FIELDS} submitLabel="Create" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Full name/), "Test Tenant");
    await userEvent.type(screen.getByLabelText(/Phone/), "254712345678");
    await userEvent.type(screen.getByLabelText(/Unit ID/), UUID);
    await userEvent.type(screen.getByLabelText(/Lease start/), "2026-11-01");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("unit not found")).toBeInTheDocument();
  });

  it("shows a conflict message for 409", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(409, "Phone already registered"));
    render(<ResourceForm specs={TENANT_CREATE_FIELDS} submitLabel="Create" onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/Full name/), "Test");
    await userEvent.type(screen.getByLabelText(/Phone/), "254712345678");
    await userEvent.type(screen.getByLabelText(/Unit ID/), UUID);
    await userEvent.type(screen.getByLabelText(/Lease start/), "2026-11-01");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("Phone already registered")).toBeInTheDocument();
  });

  it("refuses an empty PATCH", async () => {
    const onSubmit = vi.fn();
    render(
      <ResourceForm patch specs={[{ name: "unit_number", label: "Unit number", kind: "text" }]} initial={{ unit_number: "A1" }} submitLabel="Save" onSubmit={onSubmit} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("No changes");
  });
});
