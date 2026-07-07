// Pure key/target derivations for the growth-surface loader, split out of
// growth-surfaces.ts so they can be unit-tested without the async data/D1 layer
// that `getGrowthSurfaces` depends on.

import { entryCommunityTarget } from "@/lib/community-signals-lib";

type GrowthEntryRef = { category: string; slug: string };

/**
 * Stable `category:slug` grouping key for a growth entry. The `:` separator is
 * deliberately distinct from the `entry:category/slug` community-signal target
 * key produced by {@link growthSignalTarget}.
 */
export function growthEntryKey(entry: GrowthEntryRef): string {
  return `${entry.category}:${entry.slug}`;
}

/** Community-signal target key for a growth entry (`entry:category/slug`). */
export function growthSignalTarget(entry: GrowthEntryRef): string {
  return entryCommunityTarget(entry.category, entry.slug);
}
