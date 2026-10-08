import { describe, expect, it } from "vitest";
import { INVOICE_CREATE_FIELDS, TENANT_CREATE_FIELDS, UNIT_PATCH_FIELDS } from "./api/contract";
import { buildPayload, isIsoDate, isKenyanPhone, isUuid, validateAll, validateField } from "./validation";

const UUID = "123e4567-e89b-42d3-a456-426614174000";

describe("validators", () => {
  it("accepts only 254XXXXXXXXX phones", () => {
    expect(isKenyanPhone("254712345678")).toBe(true);
    for (const bad of ["0712345678", "+254712345678", "25471234567", "2547123456789", "254 712 345 678"]) {
      expect(isKenyanPhone(bad)).toBe(false);
    }
  });
  it("validates UUIDs and dates", () => {
    expect(isUuid(UUID)).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
  });
  it("enforces decimal precision and positivity", () => {
    const spec = INVOICE_CREATE_FIELDS.find((f) => f.name === "rent_amount")!;
    expect(validateField(spec, "1500")).toBeNull();
    expect(validateField(spec, "1500.50")).toBeNull();
    expect(validateField(spec, "1500.505")).not.toBeNull();
    expect(validateField(spec, "1,500")).not.toBeNull();
    expect(validateField(spec, "-5")).not.toBeNull();
    expect(validateField(spec, "0.00")).toBeNull();
  });
  it("requires required fields and reports every error", () => {
    const errs = validateAll(TENANT_CREATE_FIELDS, { full_name: "", primary_phone: "0712", unit_id: "x", lease_start_date: "" });
    expect(Object.keys(errs).sort()).toEqual(["full_name", "lease_start_date", "primary_phone", "unit_id"]);
  });
});

describe("buildPayload", () => {
  it("omits empty values rather than sending null", () => {
    const p = buildPayload(UNIT_PATCH_FIELDS, { unit_number: "A1", base_rent: "" });
    expect(p).toEqual({ unit_number: "A1" });
    expect(Object.values(p).includes(null as never)).toBe(false);
  });
  it("sends only changed fields for PATCH and keeps decimals as strings", () => {
    const p = buildPayload(
      UNIT_PATCH_FIELDS,
      { unit_number: "A1", base_rent: "20000.00" },
      { unit_number: "A1", base_rent: "18000.00" },
    );
    expect(p).toEqual({ base_rent: "20000.00" });
  });
});
