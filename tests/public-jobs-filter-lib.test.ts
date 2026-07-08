import { describe, expect, it } from "vitest";

import type { PublicJobListing } from "@/lib/jobs";
import {
  jobPostedAtMs,
  matchesBoolFilter,
  matchesQuery,
} from "@/lib/public-jobs-filter-lib";

const job = (over: Partial<PublicJobListing> = {}): PublicJobListing =>
  ({
    title: "Staff Engineer",
    company: "Acme",
    labels: [],
    ...over,
  }) as PublicJobListing;

describe("matchesQuery", () => {
  it("passes everything for an empty query", () => {
    expect(matchesQuery(job(), "")).toBe(true);
  });

  it("matches case-insensitively across searchable fields", () => {
    expect(matchesQuery(job({ location: "Remote" }), "remote")).toBe(true);
    expect(matchesQuery(job({ requirements: ["Rust", "Go"] }), "rust")).toBe(
      true,
    );
  });

  it("returns false when nothing matches", () => {
    expect(matchesQuery(job(), "kubernetes")).toBe(false);
  });

  it("tolerates missing optional array fields", () => {
    expect(
      matchesQuery(
        job({
          labels: undefined,
          benefits: undefined,
          responsibilities: undefined,
          requirements: undefined,
        }),
        "acme",
      ),
    ).toBe(true);
  });
});

describe("matchesBoolFilter", () => {
  it("passes everything for '' or 'all'", () => {
    expect(matchesBoolFilter("", true)).toBe(true);
    expect(matchesBoolFilter("all", false)).toBe(true);
  });

  it("matches the flag for 'true'/'false'", () => {
    expect(matchesBoolFilter("true", true)).toBe(true);
    expect(matchesBoolFilter("true", false)).toBe(false);
    expect(matchesBoolFilter("false", false)).toBe(true);
    expect(matchesBoolFilter("false", true)).toBe(false);
  });
});

describe("jobPostedAtMs", () => {
  it("prefers postedAt, then firstSeenAt", () => {
    expect(jobPostedAtMs(job({ postedAt: "2026-01-02T00:00:00Z" }))).toBe(
      Date.parse("2026-01-02T00:00:00Z"),
    );
    expect(
      jobPostedAtMs(
        job({ postedAt: undefined, firstSeenAt: "2026-01-01T00:00:00Z" }),
      ),
    ).toBe(Date.parse("2026-01-01T00:00:00Z"));
  });

  it("returns null when there is no parseable date", () => {
    expect(jobPostedAtMs(job())).toBeNull();
    expect(jobPostedAtMs(job({ postedAt: "not-a-date" }))).toBeNull();
  });
});
