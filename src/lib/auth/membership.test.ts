import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { resolveMembership } from "./membership";

const reject = (status: number) => vi.fn().mockRejectedValue(new ApiError(status, null));

describe("resolveMembership", () => {
  it("resolves LANDLORD first", async () => {
    const m = await resolveMembership({ landlordMe: vi.fn().mockResolvedValue({ a: 1 }), caretakerMe: reject(403), tenantMe: reject(403) });
    expect(m?.role).toBe("LANDLORD");
  });
  it("falls through 403/404 to TENANT", async () => {
    const m = await resolveMembership({ landlordMe: reject(403), caretakerMe: reject(404), tenantMe: vi.fn().mockResolvedValue({ id: "t" }) });
    expect(m?.role).toBe("TENANT");
  });
  it("returns null when no role accepts the identity", async () => {
    expect(await resolveMembership({ landlordMe: reject(403), caretakerMe: reject(403), tenantMe: reject(404) })).toBeNull();
  });
  it("rethrows 401 and server errors instead of guessing a role", async () => {
    await expect(resolveMembership({ landlordMe: reject(401), caretakerMe: reject(403), tenantMe: reject(403) })).rejects.toMatchObject({ status: 401 });
    await expect(resolveMembership({ landlordMe: reject(500), caretakerMe: reject(403), tenantMe: reject(403) })).rejects.toMatchObject({ status: 500 });
  });
});
