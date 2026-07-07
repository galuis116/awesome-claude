// Pure key/target derivations for the growth-surface loader, split out of
// growth-surfaces.ts so they can be unit-tested without the async data/D1 layer
// that `getGrowthSurfaces` depends on.

// `community-signals.ts` (the D1-backed module the previous inline `signalTarget`
// imported from) simply re-exports `entryCommunityTarget` from this same pure
// `community-signals-lib`, so importing it directly here is behaviour-identical
// to the original — just without pulling the data layer into unit tests.
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
