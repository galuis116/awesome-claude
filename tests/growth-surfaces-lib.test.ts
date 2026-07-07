import { describe, expect, it } from "vitest";

import {
  growthEntryKey,
  growthSignalTarget,
} from "../apps/web/src/lib/growth-surfaces-lib";

describe("growthEntryKey", () => {
  it("joins category and slug with a colon", () => {
    expect(growthEntryKey({ category: "mcp", slug: "github-mcp-server" })).toBe(
      "mcp:github-mcp-server",
    );
  });

  it("preserves values verbatim without normalization", () => {
    expect(growthEntryKey({ category: "Hooks", slug: "My_Slug" })).toBe(
      "Hooks:My_Slug",
    );
  });

  it("ignores extra fields on the entry object", () => {
    expect(
      growthEntryKey({ category: "tools", slug: "librechat", name: "x" } as {
        category: string;
        slug: string;
      }),
    ).toBe("tools:librechat");
  });
});

describe("growthSignalTarget", () => {
  it("produces the entry:category/slug community-signal target key", () => {
    expect(growthSignalTarget({ category: "mcp", slug: "foo" })).toBe(
      "entry:mcp/foo",
    );
  });

  it("uses a distinct separator from growthEntryKey for the same entry", () => {
    const entry = { category: "skills", slug: "bar" };
    expect(growthSignalTarget(entry)).toBe("entry:skills/bar");
    expect(growthEntryKey(entry)).toBe("skills:bar");
    expect(growthSignalTarget(entry)).not.toBe(growthEntryKey(entry));
  });
});
