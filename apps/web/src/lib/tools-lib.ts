// Pure mapping from a directory entry (+ optional commercial placement row) to a
// `ToolListing`. Split out of tools.ts so it can be unit-tested without the D1
// placement query and content loader that `getTools` depends on.

import type { DirectoryEntry, ToolListing } from "@heyclaude/registry";

export type PlacementRow = {
  target_key: string;
  tier: string;
  disclosure: string;
  starts_at: string | null;
  expires_at: string | null;
};

export function toToolListing(entry: DirectoryEntry, placement?: PlacementRow): ToolListing {
  const sponsored = placement?.tier === "sponsored";
  const featured = sponsored || placement?.tier === "featured";

  return {
    ...entry,
    featured,
    sponsored,
    disclosure: (placement?.disclosure ||
      entry.disclosure ||
      "editorial") as ToolListing["disclosure"],
    placement: placement
      ? {
          targetKind: "tool",
          targetKey: placement.target_key,
          tier: placement.tier as "standard" | "featured" | "sponsored",
          disclosure: placement.disclosure as "editorial" | "affiliate" | "sponsored",
          startsAt: placement.starts_at || undefined,
          expiresAt: placement.expires_at || undefined,
        }
      : undefined,
  };
}
