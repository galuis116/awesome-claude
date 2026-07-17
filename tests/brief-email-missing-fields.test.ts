import { describe, expect, it } from "vitest";

import {
  FEATURED_PER_SECTION,
  SECTIONS,
  buildBriefEmail,
  cardHtml,
  overflowRowHtml,
  sectionText,
  type BriefItem,
} from "../apps/web/src/lib/brief-email-lib";

const SITE = "https://heyclau.de";

function item(overrides: Partial<BriefItem> = {}): BriefItem {
  return {
    title: "Browser Bridge",
    url: "/entry/mcp/browser-bridge",
    category: "mcp",
    ...overrides,
  } as BriefItem;
}

describe("brief-email-lib cardHtml missing fields", () => {
  it("falls back to the site url and omits the description when absent", () => {
    const html = cardHtml(
      item({ url: undefined, description: undefined }),
      SITE,
    );
    expect(html).toContain(`href="${SITE}"`);
    expect(html).toContain("Browser Bridge");
  });

  it("renders a blank title for an item without one", () => {
    expect(cardHtml(item({ title: undefined }), SITE)).toContain(
      `href="${SITE}/entry/mcp/browser-bridge"`,
    );
  });

  it("escapes html in titles and descriptions", () => {
    const html = cardHtml(
      item({ title: `Tool <script> & "quotes"`, description: "a <b> desc" }),
      SITE,
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
    expect(html).not.toContain("<script>");
  });
});

describe("brief-email-lib overflowRowHtml missing fields", () => {
  it("falls back to the site url when the item has no url", () => {
    expect(overflowRowHtml(item({ url: undefined }), SITE)).toContain(
      `href="${SITE}"`,
    );
  });

  it("omits the category tag when the item has no category", () => {
    const html = overflowRowHtml(item({ category: undefined }), SITE);
    expect(html).toContain("Browser Bridge");
    expect(html).not.toContain("text-transform:uppercase");
  });
});

describe("brief-email-lib sectionText", () => {
  const section = SECTIONS[0];

  it("returns an empty string when there are no titled items", () => {
    expect(sectionText(section, undefined, SITE)).toBe("");
    expect(sectionText(section, [item({ title: undefined })], SITE)).toBe("");
  });

  it("includes a description line only when the item has one", () => {
    const withDesc = sectionText(
      section,
      [item({ description: "Runs Playwright automation." })],
      SITE,
    );
    expect(withDesc).toContain("Runs Playwright automation.");

    const withoutDesc = sectionText(section, [item()], SITE);
    expect(withoutDesc).toContain("• Browser Bridge [MCP server]");
    expect(withoutDesc).not.toContain("Runs Playwright automation.");
  });

  it("lists overflow items beyond the featured limit", () => {
    const items = Array.from({ length: FEATURED_PER_SECTION + 2 }, (_, index) =>
      item({ title: `Entry ${index}`, url: `/entry/mcp/e-${index}` }),
    );
    const text = sectionText(section, items, SITE);
    expect(text).toContain(`• Entry ${FEATURED_PER_SECTION} [MCP server] — `);
    expect(text).toContain(`${SITE}/entry/mcp/e-${FEATURED_PER_SECTION}`);
  });

  it("falls back to the site url for overflow items without a url", () => {
    const items = Array.from({ length: FEATURED_PER_SECTION + 1 }, (_, index) =>
      item({ title: `Entry ${index}`, url: undefined }),
    );
    expect(sectionText(section, items, SITE)).toContain(`— ${SITE}`);
  });
});

describe("brief-email-lib buildBriefEmail defaults", () => {
  it("builds an email for a payload with no sections or summary", () => {
    const email = buildBriefEmail({
      brief: {} as never,
      siteUrl: SITE,
      dateLabel: "2026-05-17",
    });
    expect(email.subject).toContain("HeyClaude");
    expect(email.html).toContain("May 17");
    expect(typeof email.text).toBe("string");
  });
});
