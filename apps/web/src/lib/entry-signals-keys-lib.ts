// Pure key builders for the entry signals panel, split out of
// entry-signals-panel.tsx so the localStorage and community-target key formats
// can be unit-tested and reused without React.

import type { Category } from "@/types/registry";

/** Local key for an entry's cached signal state: `${category}:${slug}`. */
export function entryKey(category: Category, slug: string) {
  return `${category}:${slug}`;
}

/**
 * Community-signals API target key for an entry: `entry:${category}/${slug}`.
 * This is the shape the signals endpoints key their counts by, distinct from
 * the local {@link entryKey} storage key.
 */
export function communityTargetKey(category: Category, slug: string) {
  return `entry:${category}/${slug}`;
}
