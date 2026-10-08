import { describe, expect, it, vi } from "vitest";
import { buildUrl, createApiClient } from "./client";
import { ApiError } from "./errors";
import { createEndpoints, normalizePage } from "./endpoints";

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status, headers }));
}

const make = (fetchImpl: typeof fetch, token: string | null = "tok-123", onUnauthorized = vi.fn()) => ({
  client: createApiClient({ baseUrl: "https://api.test/", getToken: async () => token, onUnauthorized, fetchImpl }),
  onUnauthorized,
});

describe("buildUrl", () => {
  it("prefixes /api/v1, trims base slash and drops empty query values", () => {
    expect(buildUrl("https://api.test/", "/ledger", { limit: 25, offset: 0, q: "", x: undefined, y: null })).toBe(
      "https://api.test/api/v1/ledger?limit=25&offset=0",
    );
  });
});

describe("api client", () => {
  it("attaches the bearer token and parses JSON", async () => {
    const f = mockFetch(200, [{ id: "a" }]);
    const { client } = make(f as unknown as typeof fetch);
    expect(await client.get("/properties")).toEqual([{ id: "a" }]);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/api/v1/properties");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok-123");
  });

  it("does not call the network without a token and signals unauthorized", async () => {
    const f = mockFetch(200, {});
    const { client, onUnauthorized } = make(f as unknown as typeof fetch, null);
    await expect(client.get("/properties")).rejects.toMatchObject({ status: 401 });
    expect(f).not.toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalled();
  });

  it("calls onUnauthorized on 401", async () => {
    const { client, onUnauthorized } = make(mockFetch(401, { detail: "bad token" }) as unknown as typeof fetch);
    await expect(client.get("/tenants")).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it.each([403, 404, 409, 429, 500, 502, 503])("maps HTTP %i to an ApiError with a message", async (status) => {
    const { client } = make(mockFetch(status, { detail: "A request could not be completed." }) as unknown as typeof fetch);
    const err = (await client.get("/tenants").catch((e) => e)) as ApiError;
    expect(err.status).toBe(status);
    expect(err.message.length).toBeGreaterThan(5);
  });

  it("extracts FastAPI 422 field errors", async () => {
    const detail = [{ loc: ["body", "primary_phone"], msg: "bad phone", type: "value_error" }];
    const { client } = make(mockFetch(422, { detail }) as unknown as typeof fetch);
    const err = (await client.post("/tenants", { primary_phone: "1" }).catch((e) => e)) as ApiError;
    expect(err.fieldErrors).toEqual({ primary_phone: "bad phone" });
  });

  it("surfaces Retry-After on 429", async () => {
    const { client } = make(mockFetch(429, { detail: "slow" }, { "Retry-After": "30" }) as unknown as typeof fetch);
    const err = (await client.get("/ledger").catch((e) => e)) as ApiError;
    expect(err.retryAfter).toBe("30");
  });

  it("reports network failures as status 0", async () => {
    const f = vi.fn(async () => {
      throw new TypeError("failed");
    });
    const { client } = make(f as unknown as typeof fetch);
    await expect(client.get("/properties")).rejects.toMatchObject({ status: 0 });
  });

  it("sends JSON bodies for POST/PATCH and keeps money as a string", async () => {
    const f = mockFetch(200, { id: "u1" });
    const { client } = make(f as unknown as typeof fetch);
    await client.patch("/units/u1", { base_rent: "12000.50" });
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe('{"base_rent":"12000.50"}');
  });
});

describe("endpoints", () => {
  it("never exposes STK push and encodes path ids", async () => {
    const f = mockFetch(200, {});
    const { client } = make(f as unknown as typeof fetch);
    const ep = createEndpoints(client);
    expect(Object.keys(ep).some((k) => /stk/i.test(k))).toBe(false);
    await ep.unit("a/b");
    expect((f.mock.calls[0] as unknown as [string])[0]).toContain("/units/a%2Fb");
  });

  it("normalizes bare arrays and the actual ledger envelope", () => {
    expect(normalizePage([{ id: "TEST-1" }]).items).toHaveLength(1);
    expect(normalizePage({ items: [{ id: "TEST-1" }], total: 9, limit: 50, offset: 0 }).total).toBe(9);
  });
});
