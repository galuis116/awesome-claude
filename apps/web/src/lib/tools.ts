import type { ToolListing } from "@heyclaude/registry";
import { compareToolListings } from "@heyclaude/registry/commercial";

import { getDirectoryEntriesByCategory } from "@/lib/content.server";
import { getSiteDb } from "@/lib/db";
import { toToolListing, type PlacementRow } from "@/lib/tools-lib";

async function getActivePlacements() {
  const db = getSiteDb();
  if (!db) return new Map<string, PlacementRow>();

  try {
    const { results } = await db
      .prepare(
        `SELECT target_key, tier, disclosure, starts_at, expires_at
         FROM commercial_placements
         WHERE target_kind = 'tool'
           AND status = 'active'
           AND (starts_at IS NULL OR datetime(starts_at) <= datetime('now'))
           AND (expires_at IS NULL OR datetime(expires_at) >= datetime('now'))`,
      )
      .bind()
      .all<PlacementRow>();

    return new Map(results.map((row) => [row.target_key, row]));
  } catch {
    return new Map<string, PlacementRow>();
  }
}

export async function getTools(): Promise<ToolListing[]> {
  const [entries, placements] = await Promise.all([
    getDirectoryEntriesByCategory("tools"),
    getActivePlacements(),
  ]);

  return entries
    .map((entry) =>
      toToolListing(entry, placements.get(`tools:${entry.slug}`) ?? placements.get(entry.slug)),
    )
    .sort(compareToolListings);
}

export async function getToolBySlug(slug: string): Promise<ToolListing | null> {
  const tools = await getTools();
  return tools.find((tool) => tool.slug === slug) ?? null;
}
