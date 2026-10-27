import { describe, expect, it, vi } from "vitest";
import { FakeResponse, makeRequest } from "../helpers/http";

// Simulates a broken backend config: loading the production dependencies throws.
vi.mock("../../api/_shared/dependencies", () => ({
  getDependencies: () => {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  },
}));

const { withDependencies } = await import("../../api/_shared/withDependencies");

describe("withDependencies", () => {
  it("answers CORS preflights without loading Firebase", async () => {
    const res = new FakeResponse();
    const run = vi.fn();
    await withDependencies(makeRequest({ method: "OPTIONS" }), res, "POST, OPTIONS", run);
    expect(res.statusCode).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://sesasan.github.io");
    expect(run).not.toHaveBeenCalled();
  });

  it("returns a JSON 500 with CORS headers when the backend is misconfigured", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = new FakeResponse();
    const run = vi.fn();
    await withDependencies(makeRequest(), res, "POST, OPTIONS", run);
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: "Server is not configured correctly." });
    expect(res.headers.get("access-control-allow-origin")).toBe("https://sesasan.github.io");
    expect(run).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("FIREBASE_SERVICE_ACCOUNT_JSON"));
  });

  it("still rejects origins that are not allowed", async () => {
    const res = new FakeResponse();
    await withDependencies(makeRequest({ headers: { origin: "https://evil.example" } }), res, "POST, OPTIONS", vi.fn());
    expect(res.statusCode).toBe(403);
  });
});
