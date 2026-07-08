import { describe, expect, it } from "vitest";

import type { Entry } from "@/types/registry";
import { trendingRowsFromPayload } from "@/lib/trending-rows-lib";

const entry = (category: string, slug: string): Entry =>
  ({ category, slug, title: `${category}/${slug}` }) as Entry;

const lookup =
  (known: Record<string, Entry>) => (category: string, slug: string) =>
    known[`${category}/${slug}`];

describe("trendingRowsFromPayload", () => {
  it("maps payload entries to registry-backed rows", () => {
    const rows = trendingRowsFromPayload(
      [{ category: "agents", slug: "a", score: 12.6, reasons: ["hot"] }],
      lookup({ "agents/a": entry("agents", "a") }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].slug).toBe("a");
    expect(rows[0].trendingScore).toBe(13);
    expect(rows[0].trendingReasons).toEqual(["hot"]);
  });

  it("skips entries that no longer resolve", () => {
    const rows = trendingRowsFromPayload(
      [
        { category: "agents", slug: "gone" },
        { category: "agents", slug: "a" },
      ],
      lookup({ "agents/a": entry("agents", "a") }),
    );
    expect(rows.map((row) => row.slug)).toEqual(["a"]);
  });

  it("defaults missing score to 0 and missing reasons to an empty list", () => {
    const rows = trendingRowsFromPayload(
      [{ category: "agents", slug: "a" }],
      lookup({ "agents/a": entry("agents", "a") }),
    );
    expect(rows[0].trendingScore).toBe(0);
    expect(rows[0].trendingReasons).toEqual([]);
  });

  it("returns an empty list for empty input", () => {
    expect(trendingRowsFromPayload([], lookup({}))).toEqual([]);
  });
});
