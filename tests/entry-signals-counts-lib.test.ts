import { describe, expect, it } from "vitest";

import {
  ZERO_COMMUNITY,
  asCommunityCounts,
} from "../apps/web/src/lib/entry-signals-counts-lib";

describe("ZERO_COMMUNITY", () => {
  it("is an all-zero counts object", () => {
    expect(ZERO_COMMUNITY).toEqual({ used: 0, works: 0, broken: 0 });
  });
});

describe("asCommunityCounts", () => {
  it("reads numeric fields straight through", () => {
    expect(asCommunityCounts({ used: 4, works: 3, broken: 1 })).toEqual({
      used: 4,
      works: 3,
      broken: 1,
    });
  });

  it("coerces numeric strings", () => {
    expect(asCommunityCounts({ used: "5", works: "0", broken: "2" })).toEqual({
      used: 5,
      works: 0,
      broken: 2,
    });
  });

  it("collapses missing fields to 0", () => {
    expect(asCommunityCounts({ used: 7 })).toEqual({
      used: 7,
      works: 0,
      broken: 0,
    });
  });

  it("collapses non-numeric values (which parse to NaN) to 0", () => {
    expect(asCommunityCounts({ used: "abc", works: null, broken: {} })).toEqual(
      {
        used: 0,
        works: 0,
        broken: 0,
      },
    );
  });

  it("preserves negative values", () => {
    expect(asCommunityCounts({ used: -2, works: 1, broken: 0 })).toEqual({
      used: -2,
      works: 1,
      broken: 0,
    });
  });

  it.each([null, undefined, 42, "counts", true, []])(
    "returns all zeros for non-object input (%p)",
    (value) => {
      expect(asCommunityCounts(value)).toEqual({
        used: 0,
        works: 0,
        broken: 0,
      });
    },
  );
});
