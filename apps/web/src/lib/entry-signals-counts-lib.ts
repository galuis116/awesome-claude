// Pure normalization of the community-counts payload for the entry signals
// panel, split out of entry-signals-panel.tsx so the coercion rules can be
// unit-tested without React, localStorage, or the fetch layer.

/** Used / works / broken tallies shown in the entry signals panel. */
export type CommunityCounts = {
  used: number;
  works: number;
  broken: number;
};

/** All-zero community counts, used as the pre-fetch and error fallback. */
export const ZERO_COMMUNITY: CommunityCounts = { used: 0, works: 0, broken: 0 };

/**
 * Coerce an untrusted community-counts payload (an API response or cached
 * value) into a {@link CommunityCounts}. Non-object input yields all zeros;
 * each field is read numerically and any missing or non-numeric value
 * (which parses to `NaN`) collapses to 0. Numeric strings are accepted, and
 * negative values are preserved.
 */
export function asCommunityCounts(value: unknown): CommunityCounts {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    used: Number(source.used ?? 0) || 0,
    works: Number(source.works ?? 0) || 0,
    broken: Number(source.broken ?? 0) || 0,
  };
}
