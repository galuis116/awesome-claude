import { describe, expect, it } from "vitest";

import type { Category } from "../apps/web/src/types/registry";
import {
  communityTargetKey,
  entryKey,
} from "../apps/web/src/lib/entry-signals-keys-lib";

describe("entryKey", () => {
  it("joins category and slug with a colon", () => {
    expect(entryKey("mcp" as Category, "opensearch")).toBe("mcp:opensearch");
  });
});

describe("communityTargetKey", () => {
  it("builds the entry: target namespace with a slash separator", () => {
    expect(communityTargetKey("mcp" as Category, "opensearch")).toBe(
      "entry:mcp/opensearch",
    );
  });

  it("differs from the local entryKey for the same input", () => {
    const category = "agents" as Category;
    const slug = "reviewer";
    expect(communityTargetKey(category, slug)).not.toBe(
      entryKey(category, slug),
    );
  });
});
