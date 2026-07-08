// Pure mapping of raw trending payload entries to registry-backed rows, split
// out of the trending route so the lookup/skip/score-rounding can be unit-tested
// without the live payload or the registry data module.

import type { Entry } from "@/types/registry";

export type TrendingEntry = Entry & {
  trendingScore?: number;
  trendingReasons?: string[];
};

export type TrendingPayloadEntry = {
  category: string;
  slug: string;
  score?: number;
  reasons?: string[];
};

/**
 * Map raw trending payload entries to registry-backed rows, skipping any whose
 * (category, slug) no longer resolves to a known entry. Scores are rounded and
 * missing reasons default to an empty list.
 */
export function trendingRowsFromPayload(
  entries: ReadonlyArray<TrendingPayloadEntry>,
  getEntry: (category: string, slug: string) => Entry | undefined,
): TrendingEntry[] {
  const rows: TrendingEntry[] = [];
  for (const item of entries) {
    const entry = getEntry(item.category, item.slug);
    if (!entry) continue;
    rows.push({
      ...entry,
      trendingScore: Math.round(Number(item.score ?? 0)),
      trendingReasons: item.reasons ?? [],
    });
  }
  return rows;
}
