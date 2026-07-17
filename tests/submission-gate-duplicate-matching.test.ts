import { describe, expect, it } from "vitest";

import {
  findContentDuplicateMatch,
  findRelatedContentMatches,
  findStrictContentDuplicateMatch,
  type ContentDuplicateSignals,
} from "../apps/submission-gate/src/duplicates";

function sig(
  overrides: Partial<ContentDuplicateSignals> = {},
): ContentDuplicateSignals {
  return {
    filePath: "content/mcp/a.mdx",
    category: "mcp",
    slug: "a",
    title: "A Tool",
    normalizedTitle: "a tool",
    normalizedDescription: "a description",
    urls: ["https://example.com/a"],
    domains: ["example.com"],
    ...overrides,
  };
}

describe("submission-gate findContentDuplicateMatch (legacy/loose)", () => {
  it("matches on the same content path", () => {
    const candidate = sig({ filePath: "content/mcp/b.mdx" });
    const existing = sig({ filePath: "content/mcp/b.mdx" });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining("same content path")]),
    );
  });

  it("matches on the same category and slug", () => {
    const candidate = sig({ filePath: "content/mcp/a.mdx", slug: "shared" });
    const existing = sig({ filePath: "content/mcp/other.mdx", slug: "shared" });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining("same mcp slug")]),
    );
  });

  it("matches on a shared canonical URL", () => {
    const candidate = sig({ urls: ["https://example.com/shared"] });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: ["https://example.com/shared"],
    });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same canonical source URL"),
      ]),
    );
  });

  it("matches on the same normalized title within a category", () => {
    const candidate = sig({ urls: [], domains: [] });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: [],
    });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same normalized title in mcp"),
      ]),
    );
  });

  it("matches on the same non-generic domain plus the same title", () => {
    const candidate = sig({
      urls: [],
      domains: ["vendor.example"],
      normalizedTitle: "shared title",
    });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: ["vendor.example"],
      normalizedTitle: "shared title",
    });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same source domain vendor.example and title"),
      ]),
    );
  });

  it("aggressively matches on a shared non-generic domain within a category, even with different titles", () => {
    const candidate = sig({
      urls: [],
      domains: ["vendor.example"],
      normalizedTitle: "title one",
    });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: ["vendor.example"],
      normalizedTitle: "title two",
    });
    expect(findContentDuplicateMatch(candidate, [existing])?.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "same non-generic source domain vendor.example",
        ),
      ]),
    );
  });

  it("does not treat a shared excluded generic domain as a duplicate signal on its own", () => {
    const candidate = sig({
      slug: "candidate-slug",
      urls: [],
      domains: ["github.com"],
      normalizedTitle: "title one",
    });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      slug: "existing-slug",
      urls: [],
      domains: ["github.com"],
      normalizedTitle: "title two",
      normalizedDescription: "different description",
    });
    expect(findContentDuplicateMatch(candidate, [existing])).toBeNull();
  });

  it("returns null when nothing in the catalog matches", () => {
    const candidate = sig({
      filePath: "content/mcp/unique.mdx",
      slug: "unique",
      normalizedTitle: "unique title",
      normalizedDescription: "unique description",
      urls: ["https://example.com/unique"],
      domains: ["example.com"],
    });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      slug: "other",
      normalizedTitle: "other title",
      normalizedDescription: "other description",
      urls: ["https://other.example/x"],
      domains: ["other.example"],
    });
    expect(findContentDuplicateMatch(candidate, [existing])).toBeNull();
  });
});

describe("submission-gate findStrictContentDuplicateMatch", () => {
  it("matches on the same content path", () => {
    const candidate = sig({ filePath: "content/mcp/b.mdx" });
    const existing = sig({ filePath: "content/mcp/b.mdx" });
    expect(
      findStrictContentDuplicateMatch(candidate, [existing])?.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("same content path")]),
    );
  });

  it("matches on the same category and slug", () => {
    const candidate = sig({ filePath: "content/mcp/a.mdx", slug: "shared" });
    const existing = sig({ filePath: "content/mcp/other.mdx", slug: "shared" });
    expect(
      findStrictContentDuplicateMatch(candidate, [existing])?.reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("same mcp slug")]),
    );
  });

  it("matches on a shared multi-entry catalog subpath URL within a category", () => {
    const catalogSubpath =
      "https://github.com/modelcontextprotocol/servers/weather";
    const candidate = sig({ urls: [catalogSubpath] });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: [catalogSubpath],
    });
    expect(
      findStrictContentDuplicateMatch(candidate, [existing])?.reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same multi-entry catalog subpath URL"),
      ]),
    );
  });

  it("matches on a shared canonical URL plus the same normalized description", () => {
    const candidate = sig({ urls: ["https://example.com/shared"] });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: ["https://example.com/shared"],
    });
    expect(
      findStrictContentDuplicateMatch(candidate, [existing])?.reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "same canonical source URL https://example.com/shared and same normalized description",
        ),
      ]),
    );
  });

  it("matches collections on two or more shared source URLs", () => {
    const candidate = sig({
      category: "collections",
      normalizedDescription: "collection one",
      urls: ["https://example.com/x", "https://example.com/y"],
    });
    const existing = sig({
      filePath: "content/collections/other.mdx",
      category: "collections",
      normalizedDescription: "collection two",
      urls: ["https://example.com/x", "https://example.com/y"],
    });
    expect(
      findStrictContentDuplicateMatch(candidate, [existing])?.reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same collection source set including"),
      ]),
    );
  });

  it("returns null when nothing strictly matches", () => {
    const candidate = sig({
      filePath: "content/mcp/unique.mdx",
      slug: "unique",
      urls: ["https://example.com/unique"],
      normalizedDescription: "unique description",
    });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      slug: "other",
      urls: ["https://other.example/x"],
      normalizedDescription: "other description",
    });
    expect(findStrictContentDuplicateMatch(candidate, [existing])).toBeNull();
  });
});

describe("submission-gate findRelatedContentMatches", () => {
  it("skips the candidate's own file path", () => {
    const candidate = sig();
    const existing = sig();
    expect(findRelatedContentMatches(candidate, [existing])).toEqual([]);
  });

  it("flags a shared URL across categories, noting the collection bridge case", () => {
    const candidate = sig({ category: "collections" });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      category: "mcp",
    });
    expect(findRelatedContentMatches(candidate, [existing])[0].reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("across collection/resource categories"),
      ]),
    );

    const candidateB = sig({ category: "hooks" });
    const existingB = sig({
      filePath: "content/mcp/other.mdx",
      category: "mcp",
    });
    expect(
      findRelatedContentMatches(candidateB, [existingB])[0].reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("across hooks/mcp")]),
    );
  });

  it("flags a shared URL within the same category as related but not strict", () => {
    const candidate = sig();
    const existing = sig({ filePath: "content/mcp/other.mdx" });
    expect(findRelatedContentMatches(candidate, [existing])[0].reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("but not a strict duplicate"),
      ]),
    );
  });

  it("flags a shared multi-entry catalog URL within a category", () => {
    const catalogRoot = "https://github.com/modelcontextprotocol/servers";
    const candidate = sig({ urls: [`${catalogRoot}/weather`] });
    const existing = sig({
      filePath: "content/mcp/other.mdx",
      urls: [`${catalogRoot}/maps`],
    });
    expect(findRelatedContentMatches(candidate, [existing])[0].reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same multi-entry catalog source URL"),
      ]),
    );
  });

  it("flags a shared non-generic domain, phrased for same or different categories", () => {
    const candidate = sig({ urls: [], domains: ["vendor.example"] });
    const sameCategory = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: ["vendor.example"],
    });
    expect(
      findRelatedContentMatches(candidate, [sameCategory])[0].reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "same non-generic source domain vendor.example in mcp",
        ),
      ]),
    );

    const otherCategory = sig({
      filePath: "content/hooks/other.mdx",
      category: "hooks",
      urls: [],
      domains: ["vendor.example"],
    });
    expect(
      findRelatedContentMatches(candidate, [otherCategory])[0].reasons,
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("across mcp/hooks")]),
    );
  });

  it("flags the same normalized title or description within a category", () => {
    const candidate = sig({ urls: [], domains: [] });
    const sameTitle = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: [],
      normalizedDescription: "a different description",
    });
    expect(
      findRelatedContentMatches(candidate, [sameTitle])[0].reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same normalized title in mcp"),
      ]),
    );

    const sameDescription = sig({
      filePath: "content/mcp/other.mdx",
      urls: [],
      domains: [],
      normalizedTitle: "a different title",
    });
    expect(
      findRelatedContentMatches(candidate, [sameDescription])[0].reasons,
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("same normalized description in mcp"),
      ]),
    );
  });

  it("stops collecting matches once the limit is reached", () => {
    const candidate = sig({ urls: [], domains: [], normalizedDescription: "" });
    const existingItems = Array.from({ length: 8 }, (_, index) =>
      sig({
        filePath: `content/mcp/other-${index}.mdx`,
        urls: [],
        domains: [],
        normalizedDescription: "",
      }),
    );
    expect(findRelatedContentMatches(candidate, existingItems)).toHaveLength(5);
    expect(findRelatedContentMatches(candidate, existingItems, 2)).toHaveLength(
      2,
    );
  });
});
