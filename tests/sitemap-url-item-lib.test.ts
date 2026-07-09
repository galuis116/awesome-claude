import { describe, expect, it } from "vitest";

import { sitemapUrlItem } from "../apps/web/src/lib/sitemap-url-item-lib";

const SITE = "https://heyclau.de";

describe("sitemapUrlItem", () => {
  it("renders loc, lastmod, changefreq and priority in sitemap order", () => {
    expect(
      sitemapUrlItem({
        siteUrl: SITE,
        pathname: "/browse",
        priority: "0.8",
        changefreq: "daily",
        lastmod: "2026-07-08",
      }),
    ).toBe(
      [
        "  <url>",
        "    <loc>https://heyclau.de/browse</loc>",
        "    <lastmod>2026-07-08</lastmod>",
        "    <changefreq>daily</changefreq>",
        "    <priority>0.8</priority>",
        "  </url>",
      ].join("\n"),
    );
  });

  it("defaults changefreq to weekly", () => {
    const xml = sitemapUrlItem({
      siteUrl: SITE,
      pathname: "/",
      priority: "1.0",
    });
    expect(xml).toContain("<changefreq>weekly</changefreq>");
  });

  it("truncates an ISO timestamp lastmod to YYYY-MM-DD", () => {
    const xml = sitemapUrlItem({
      siteUrl: SITE,
      pathname: "/x",
      priority: "0.5",
      lastmod: "2026-07-08T12:34:56.000Z",
    });
    expect(xml).toContain("<lastmod>2026-07-08</lastmod>");
  });

  it("omits the lastmod line entirely when lastmod is absent or empty", () => {
    expect(
      sitemapUrlItem({ siteUrl: SITE, pathname: "/x", priority: "0.5" }),
    ).not.toContain("<lastmod>");
    expect(
      sitemapUrlItem({
        siteUrl: SITE,
        pathname: "/x",
        priority: "0.5",
        lastmod: "",
      }),
    ).not.toContain("<lastmod>");
  });

  it("XML-escapes the loc", () => {
    const xml = sitemapUrlItem({
      siteUrl: SITE,
      pathname: "/tags/a&b",
      priority: "0.5",
    });
    expect(xml).toContain("<loc>https://heyclau.de/tags/a&amp;b</loc>");
  });
});
