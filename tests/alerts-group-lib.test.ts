import { describe, expect, it } from "vitest";

import { groupAlertsByBucket } from "../apps/web/src/lib/alerts-group-lib";

const DAY_MS = 86_400_000;
const NOW = Date.parse("2026-07-08T12:00:00.000Z");

const at = (id: string, msAgo: number) => ({
  id,
  date: new Date(NOW - msAgo).toISOString(),
});

describe("groupAlertsByBucket", () => {
  it("always returns all three buckets, empty for no alerts", () => {
    expect(groupAlertsByBucket([], NOW)).toEqual({
      Today: [],
      "This week": [],
      Earlier: [],
    });
  });

  it("routes alerts into Today, This week, and Earlier by age", () => {
    const grouped = groupAlertsByBucket(
      [at("today", 1000), at("week", 3 * DAY_MS), at("old", 30 * DAY_MS)],
      NOW,
    );
    expect(grouped.Today.map((a) => a.id)).toEqual(["today"]);
    expect(grouped["This week"].map((a) => a.id)).toEqual(["week"]);
    expect(grouped.Earlier.map((a) => a.id)).toEqual(["old"]);
  });

  it("preserves input order within a bucket", () => {
    const grouped = groupAlertsByBucket(
      [at("a", 1000), at("b", 2000), at("c", 3000)],
      NOW,
    );
    expect(grouped.Today.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("puts unparseable dates in Earlier", () => {
    const grouped = groupAlertsByBucket(
      [{ id: "bad", date: "not-a-date" }],
      NOW,
    );
    expect(grouped.Earlier.map((a) => a.id)).toEqual(["bad"]);
    expect(grouped.Today).toEqual([]);
  });
});
