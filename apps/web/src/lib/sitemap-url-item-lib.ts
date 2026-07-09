// Pure <url> entry rendering for the XML sitemap, split out of sitemap[.]xml.ts
// so the escaping, lastmod normalization, and field order can be unit-tested
// without the generated registry or the route.

import { escapeXml } from "@/lib/xml-escape-lib";

/**
 * Render one `<url>` block for the XML sitemap. `loc` is `siteUrl + pathname`,
 * XML-escaped. `lastmod` is truncated to its leading `YYYY-MM-DD` and the line
 * is omitted entirely when it resolves to an empty string. Fields are emitted
 * in sitemap order: loc, lastmod, changefreq, priority.
 */
export function sitemapUrlItem({
  siteUrl,
  pathname,
  priority,
  changefreq = "weekly",
  lastmod,
}: {
  siteUrl: string;
  pathname: string;
  priority: string;
  changefreq?: string;
  lastmod?: string;
}): string {
  const day = String(lastmod || "").slice(0, 10);
  return [
    "  <url>",
    `    <loc>${escapeXml(`${siteUrl}${pathname}`)}</loc>`,
    day ? `    <lastmod>${escapeXml(day)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}
