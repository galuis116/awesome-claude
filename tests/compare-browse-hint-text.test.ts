import { describe, expect, it } from "vitest";

import {
  browseCompareHintText,
  browseCompareOverflowHint,
} from "../apps/web/src/lib/compare-browse-summary-lib";

const plainEntries = [
  { category: "mcp", slug: "a", title: "A" },
  { category: "mcp", slug: "b", title: "B" },
];

describe("compare-browse-summary-lib browseCompareOverflowHint", () => {
  it("returns null when nothing overflows", () => {
    expect(browseCompareOverflowHint(2, 2)).toBeNull();
    expect(browseCompareOverflowHint(1, 2)).toBeNull();
  });

  it("reports how many of the selected entries open", () => {
    expect(browseCompareOverflowHint(5, 3)).toBe(
      "Opening 3 of 5 selected in compare.",
    );
  });
});

describe("compare-browse-summary-lib browseCompareHintText", () => {
  it("returns null below the minimum compare count", () => {
    expect(browseCompareHintText([] as never)).toBeNull();
    expect(
      browseCompareHintText([
        { category: "mcp", slug: "a", title: "A" },
      ] as never),
    ).toBeNull();
  });

  it("invites a side-by-side review when nothing diverges", () => {
    expect(browseCompareHintText(plainEntries as never)).toBe(
      "Open compare to review trust and next steps side by side.",
    );
  });

  it("uses the singular signal wording for one diverging row", () => {
    expect(
      browseCompareHintText([
        { category: "mcp", slug: "a", title: "A", reviewedBy: "maintainer" },
        { category: "mcp", slug: "b", title: "B" },
      ] as never),
    ).toBe("1 trust signal differ — open compare for details.");
  });

  it("uses the plural signal wording for multiple diverging rows", () => {
    expect(
      browseCompareHintText([
        {
          category: "mcp",
          slug: "a",
          title: "A",
          reviewedBy: "maintainer",
          submittedBy: "@alice",
          repoUrl: "https://github.com/example/a",
        },
        { category: "mcp", slug: "b", title: "B" },
      ] as never),
    ).toBe("2 trust signals differ — open compare for details.");
  });

  it("reports diverging next steps on their own", () => {
    expect(
      browseCompareHintText([
        { category: "mcp", slug: "a", title: "A", installCommand: "npx -y a" },
        { category: "mcp", slug: "b", title: "B" },
      ] as never),
    ).toBe("next steps differ — open compare for details.");
  });

  it("joins signal and next-step divergence", () => {
    expect(
      browseCompareHintText([
        {
          category: "mcp",
          slug: "a",
          title: "A",
          reviewedBy: "maintainer",
          installCommand: "npx -y a",
        },
        { category: "mcp", slug: "b", title: "B" },
      ] as never),
    ).toBe(
      "1 trust signal differ · next steps differ — open compare for details.",
    );
  });
});
