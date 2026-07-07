import { describe, expect, it } from "vitest";

import type {
  OpenApiEndpoint,
  OpenApiParam,
} from "../apps/web/src/data/openapi";
import { buildRequestUrl } from "../apps/web/src/lib/openapi-request-lib";

const param = (
  over: Partial<OpenApiParam> & Pick<OpenApiParam, "name" | "in">,
) => ({ ...over }) as OpenApiParam;

const endpoint = (over: Partial<OpenApiEndpoint>): OpenApiEndpoint =>
  ({ path: "/", ...over }) as OpenApiEndpoint;

describe("buildRequestUrl", () => {
  it("returns a plain path unchanged when there is nothing to substitute", () => {
    expect(buildRequestUrl(endpoint({ path: "/api/v1/health" }), {})).toBe(
      "/api/v1/health",
    );
  });

  it("substitutes a path param from the provided values", () => {
    const ep = endpoint({
      path: "/api/v1/subnets/{netuid}",
      parameters: [param({ name: "netuid", in: "path" })],
    });
    expect(buildRequestUrl(ep, { netuid: "64" })).toBe("/api/v1/subnets/64");
  });

  it("falls back to the parameter example when no value is provided", () => {
    const ep = endpoint({
      path: "/api/v1/subnets/{netuid}",
      parameters: [param({ name: "netuid", in: "path", example: "1" })],
    });
    expect(buildRequestUrl(ep, {})).toBe("/api/v1/subnets/1");
  });

  it("url-encodes substituted path segments", () => {
    const ep = endpoint({
      path: "/api/v1/search/{q}",
      parameters: [param({ name: "q", in: "path" })],
    });
    expect(buildRequestUrl(ep, { q: "a b/c" })).toBe(
      "/api/v1/search/a%20b%2Fc",
    );
  });

  it("substitutes an unknown path param with an empty segment", () => {
    expect(buildRequestUrl(endpoint({ path: "/x/{missing}" }), {})).toBe("/x/");
  });

  it("appends non-empty query params and skips empty ones", () => {
    const ep = endpoint({
      path: "/api/v1/entries",
      parameters: [
        param({ name: "category", in: "query" }),
        param({ name: "limit", in: "query", example: "10" }),
        param({ name: "cursor", in: "query" }),
      ],
    });
    expect(buildRequestUrl(ep, { category: "mcp" })).toBe(
      "/api/v1/entries?category=mcp&limit=10",
    );
  });

  it("ignores non-query params when building the query string", () => {
    const ep = endpoint({
      path: "/api/v1/subnets/{netuid}",
      parameters: [
        param({ name: "netuid", in: "path", example: "7" }),
        param({ name: "x-key", in: "header", example: "secret" }),
      ],
    });
    expect(buildRequestUrl(ep, {})).toBe("/api/v1/subnets/7");
  });
});
