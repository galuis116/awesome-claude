// Pure, SSR-safe helpers for the analytics layer. These are deterministic
// string derivations with no `window`/tracker side effects, split out from
// `analytics.ts` so they can be unit-tested directly (the tracker call in
// `analytics.ts` stays behind the browser guard). Event data never carries PII,
// so these helpers only derive stable grouping keys and coarse hostnames.

import { publicUrlHostname } from "@heyclaude/registry/source-url";

/** An entry's stable `category/slug` key, for grouping events by resource. */
export function entryEventKey(category: string, slug: string): string {
  return `${category}/${slug}`;
}

/** Hostname of an outbound URL, for grouping source clicks (no full URL / PII). */
export function outboundHost(url: string): string {
  const hostname = publicUrlHostname(url);
  return hostname || "unknown";
}
