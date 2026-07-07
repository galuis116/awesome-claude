import { describe, expect, it } from "vitest";

import type { DirectoryEntry } from "@heyclaude/registry";

import {
  toToolListing,
  type PlacementRow,
} from "../apps/web/src/lib/tools-lib";

const entry = (overrides: Partial<DirectoryEntry> = {}) =>
  ({ slug: "librechat", title: "LibreChat", ...overrides }) as DirectoryEntry;

const placement = (overrides: Partial<PlacementRow> = {}): PlacementRow => ({
  target_key: "tools:librechat",
  tier: "standard",
  disclosure: "editorial",
  starts_at: null,
  expires_at: null,
  ...overrides,
});

describe("toToolListing", () => {
  it("defaults to non-featured, non-sponsored, editorial disclosure with no placement", () => {
    const listing = toToolListing(entry());
    expect(listing.featured).toBe(false);
    expect(listing.sponsored).toBe(false);
    expect(listing.disclosure).toBe("editorial");
    expect(listing.placement).toBeUndefined();
  });

  it("spreads the original entry fields through", () => {
    const listing = toToolListing(entry({ slug: "x", title: "X Tool" }));
    expect(listing.slug).toBe("x");
    expect(listing.title).toBe("X Tool");
  });

  it("marks a sponsored placement as both sponsored and featured", () => {
    const listing = toToolListing(entry(), placement({ tier: "sponsored" }));
    expect(listing.sponsored).toBe(true);
    expect(listing.featured).toBe(true);
  });

  it("marks a featured placement as featured but not sponsored", () => {
    const listing = toToolListing(entry(), placement({ tier: "featured" }));
    expect(listing.sponsored).toBe(false);
    expect(listing.featured).toBe(true);
  });

  it("leaves a standard placement neither featured nor sponsored", () => {
    const listing = toToolListing(entry(), placement({ tier: "standard" }));
    expect(listing.sponsored).toBe(false);
    expect(listing.featured).toBe(false);
  });

  it("prefers the placement disclosure, then the entry disclosure, then editorial", () => {
    expect(
      toToolListing(entry(), placement({ disclosure: "sponsored" })).disclosure,
    ).toBe("sponsored");
    expect(
      toToolListing(
        entry({ disclosure: "affiliate" }),
        placement({ disclosure: "" }),
      ).disclosure,
    ).toBe("affiliate");
    expect(toToolListing(entry({ disclosure: undefined })).disclosure).toBe(
      "editorial",
    );
  });

  it("maps placement window fields and coerces empty dates to undefined", () => {
    const listing = toToolListing(
      entry(),
      placement({
        tier: "featured",
        disclosure: "affiliate",
        starts_at: "2026-01-01",
        expires_at: null,
      }),
    );
    expect(listing.placement).toEqual({
      targetKind: "tool",
      targetKey: "tools:librechat",
      tier: "featured",
      disclosure: "affiliate",
      startsAt: "2026-01-01",
      expiresAt: undefined,
    });
  });
});
