// Pure recency-grouping for the alerts dropdown, split out of
// alerts-dropdown.tsx so the bucketing can be unit-tested with an injected
// `now` (no reliance on the real clock).

import { type AlertBucket, alertBucket } from "@/lib/alerts-bucket-lib";

/** Alerts keyed by recency bucket, in display order. */
export type GroupedAlerts<T> = Record<AlertBucket, T[]>;

/**
 * Group alerts into "Today" / "This week" / "Earlier" by their ISO `date`
 * relative to `now` (epoch ms), using {@link alertBucket}. Every bucket is
 * always present — empty when it has no alerts — and the input order is
 * preserved within each bucket.
 */
export function groupAlertsByBucket<T extends { date: string }>(
  alerts: readonly T[],
  now: number,
): GroupedAlerts<T> {
  const out: GroupedAlerts<T> = { Today: [], "This week": [], Earlier: [] };
  for (const a of alerts) out[alertBucket(a.date, now)].push(a);
  return out;
}
