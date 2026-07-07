import { describe, expect, it } from "vitest";

import { entryEventKey, outboundHost } from "../apps/web/src/lib/analytics-lib";

describe("entryEventKey", () => {
  it("joins category and slug with a slash", () => {
    expect(entryEventKey("mcp", "github-mcp-server")).toBe(
      "mcp/github-mcp-server",
    );
  });

  it("preserves the exact category and slug values (no normalization)", () => {
    expect(entryEventKey("Hooks", "My_Slug")).toBe("Hooks/My_Slug");
  });

  it("keeps empty segments so the key shape stays stable", () => {
    expect(entryEventKey("", "")).toBe("/");
    expect(entryEventKey("tools", "")).toBe("tools/");
  });
});

describe("outboundHost", () => {
  it("returns the hostname for a plain https URL", () => {
    expect(outboundHost("https://example.com/path?q=1")).toBe("example.com");
  });

  it("strips a leading www. prefix", () => {
    expect(outboundHost("https://www.example.com")).toBe("example.com");
  });

  it("lowercases the hostname", () => {
    expect(outboundHost("https://GitHub.com/owner/repo")).toBe("github.com");
  });

  it("keeps non-www subdomains intact", () => {
    expect(outboundHost("http://api.sub.example.io/v1")).toBe(
      "api.sub.example.io",
    );
  });

  it("returns 'unknown' for a URL that embeds credentials", () => {
    expect(outboundHost("https://user:pass@example.com/x")).toBe("unknown");
  });

  it("returns 'unknown' for a non-URL string", () => {
    expect(outboundHost("not a url")).toBe("unknown");
  });

  it("returns 'unknown' for an empty string", () => {
    expect(outboundHost("")).toBe("unknown");
  });
});
