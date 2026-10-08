import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { DataState } from "./DataState";
import { statusVariant } from "./StatusBadge";
import { DateTimeEAT, Money, PhoneNumber, ReceiptCode } from "./DesignSystem";

describe("DataState", () => {
  it("shows a loading status", () => {
    render(<DataState state={{ status: "loading" }}>{() => <p>data</p>}</DataState>);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("shows an empty state", () => {
    render(
      <DataState state={{ status: "success", data: [] as number[] }} isEmpty={(d) => d.length === 0} emptyTitle="No properties">
        {() => <p>data</p>}
      </DataState>,
    );
    expect(screen.getByText("No properties")).toBeInTheDocument();
  });

  it("shows errors with retry for server failures", async () => {
    const retry = vi.fn();
    render(<DataState state={{ status: "error", error: new ApiError(503, null) }} onRetry={retry}>{() => null}</DataState>);
    expect(screen.getByRole("alert")).toHaveTextContent(/temporarily unavailable/i);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(retry).toHaveBeenCalled();
  });

  it("does not offer retry for 403", () => {
    render(<DataState state={{ status: "error", error: new ApiError(403, "no") }} onRetry={() => {}}>{() => null}</DataState>);
    expect(screen.getByText("Not permitted")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders data on success", () => {
    render(<DataState state={{ status: "success", data: "hello" }}>{(d) => <p>{d}</p>}</DataState>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});

describe("design system data components", () => {
  it("formats string money, phone, receipt, and EAT date/time", () => {
    render(<><Money value="1000000.50" /><PhoneNumber value="254712345678" /><ReceiptCode value="TEST-RECEIPT" /><DateTimeEAT value="2026-01-02T00:00:00Z" /></>);
    expect(screen.getByText("KES 1,000,000.50")).toBeInTheDocument();
    expect(screen.getByText("+254 712 345 678")).toBeInTheDocument();
    expect(screen.getByText("TEST-RECEIPT")).toBeInTheDocument();
    expect(screen.getByText(/EAT/)).toBeInTheDocument();
  });
});

describe("status colours", () => {
  it("maps statuses to semantic variants", () => {
    expect(statusVariant("COMPLETED")).toBe("paid");
    expect(statusVariant("pending")).toBe("partial");
    expect(statusVariant("REVERSED")).toBe("overdue");
    expect(statusVariant("something_else")).toBe("vacant");
  });
});
