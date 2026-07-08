// Pure filter/sort helpers for the public jobs API route, split out so the
// free-text match, tri-state boolean filter, and posted-at parsing can be
// unit-tested without invoking the handler.

import type { PublicJobListing } from "@/lib/jobs";

/** Case-insensitive free-text match across a job's searchable fields. */
export function matchesQuery(job: PublicJobListing, query: string): boolean {
  if (!query) return true;
  const haystack = [
    job.title,
    job.company,
    job.location,
    job.description,
    job.type,
    job.compensation,
    job.equity,
    job.bonus,
    job.sourceLabel,
    ...(job.labels ?? []),
    ...(job.benefits ?? []),
    ...(job.responsibilities ?? []),
    ...(job.requirements ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

/** Tri-state boolean filter: "" / "all" pass everything, else match the flag. */
export function matchesBoolFilter(filter: "all" | "true" | "false" | "", value: boolean): boolean {
  if (!filter || filter === "all") return true;
  return filter === "true" ? value : !value;
}

/** Parse a job's posted time (postedAt, then firstSeenAt) to epoch ms, or null. */
export function jobPostedAtMs(job: PublicJobListing): number | null {
  const candidates = [job.postedAt, job.firstSeenAt];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = Date.parse(candidate);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
