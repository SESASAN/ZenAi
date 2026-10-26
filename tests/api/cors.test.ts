import { describe, expect, it } from "vitest";
import { applyCorsHeaders, isOriginAllowed } from "../../api/_modules/shared/http/cors";
import { FakeResponse, makeRequest } from "../helpers/http";

describe("CORS", () => {
  it("allows the production origin, localhost and configured origins", () => {
    expect(isOriginAllowed("https://sesasan.github.io", {})).toBe(true);
    expect(isOriginAllowed("http://localhost:5173", {})).toBe(true);
    expect(isOriginAllowed("http://127.0.0.1:3001", {})).toBe(true);
    expect(isOriginAllowed("https://zenai.example.com", { ALLOWED_ORIGINS: "https://zenai.example.com/, https://x.dev" })).toBe(true);
  });

  it("rejects other origins", () => {
    expect(isOriginAllowed("https://evil.example", {})).toBe(false);
    expect(isOriginAllowed("http://localhost.evil.example", {})).toBe(false);
    expect(isOriginAllowed("https://sesasan.github.io.evil.example", {})).toBe(false);
  });

  it("echoes the allowed origin instead of using *", () => {
    const res = new FakeResponse();
    expect(applyCorsHeaders(makeRequest(), res, "POST, OPTIONS", {})).toBe(true);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://sesasan.github.io");
    expect(res.headers.get("vary")).toBe("Origin");
  });

  it("does not set CORS headers for disallowed origins", () => {
    const res = new FakeResponse();
    const req = makeRequest({ headers: { origin: "https://evil.example" } });
    expect(applyCorsHeaders(req, res, "POST, OPTIONS", {})).toBe(false);
    expect(res.headers.has("access-control-allow-origin")).toBe(false);
  });

  it("lets requests without Origin through (server-to-server)", () => {
    const res = new FakeResponse();
    expect(applyCorsHeaders(makeRequest({ headers: {} }), res, "GET", {})).toBe(true);
    expect(res.headers.has("access-control-allow-origin")).toBe(false);
  });
});
