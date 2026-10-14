import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FRONTEND_API_ROUTES } from "./endpoints";

describe("generated API contract", () => {
  it("contains every route and method called by the frontend", () => {
    const schema = JSON.parse(readFileSync(resolve(process.cwd(), "contracts/openapi.json"), "utf8")) as {
      paths: Record<string, Record<string, unknown>>;
    };
    for (const route of FRONTEND_API_ROUTES) {
      const [method = "", path = ""] = route.split(" ");
      expect(schema.paths[path], `Missing OpenAPI path ${path}`).toBeDefined();
      expect(schema.paths[path]?.[method.toLowerCase()], `Missing ${route}`).toBeDefined();
    }
    expect(FRONTEND_API_ROUTES.some((route) => route.includes("stk-push"))).toBe(true);
  });
});
