import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./format";
import { formatKes, isDecimalLike } from "./money";

describe("money", () => {
  it("formats decimal strings without floating point", () => {
    expect(formatKes("1362000")).toBe("KES 1,362,000");
    expect(formatKes("1234.50")).toBe("KES 1,234.50");
    expect(formatKes("0.10")).toBe("KES 0.10");
    expect(formatKes("-475000.00")).toBe("KES -475,000.00");
  });
  it("preserves precision beyond double range", () => {
    expect(formatKes("9007199254740993.01")).toBe("KES 9,007,199,254,740,993.01");
  });
  it("leaves non-decimal input untouched", () => {
    expect(formatKes("abc")).toBe("abc");
    expect(isDecimalLike("12.30")).toBe(true);
    expect(isDecimalLike(12.3)).toBe(false);
  });
});

describe("dates", () => {
  it("does not shift date-only values", () => {
    expect(formatDate("2026-03-01")).toContain("2026");
    expect(formatDate("2026-03-01")).toMatch(/1/);
  });
  it("shows timestamps in EAT", () => {
    expect(formatDateTime("2026-03-01T21:30:00Z")).toMatch(/EAT$/);
    expect(formatDateTime("2026-03-01T21:30:00Z")).toMatch(/12:30|00:30/); // 21:30Z -> 00:30 next day EAT
  });
  it("passes through unparseable strings", () => {
    expect(formatDate("soon")).toBe("soon");
  });
});
