export function isValidEntryKey(key: string) {
  return /^[a-z0-9-]+:[a-z0-9-]+$/.test(key);
}

/**
 * Vote client ids are opaque, browser-generated correlation tokens (`hc-<uuid>`)
 * and the votes table stores them verbatim, so only the URL-safe base64
 * alphabet is accepted â€” the same guard `normalizeCommunityClientId` already
 * applies to community signals. This keeps free text (an email, a URL carrying
 * a token, a JWT) out of `votes.client_id`. The existing 8..128 length bound is
 * unchanged, so every id a current client generates keeps working.
 */
const VOTE_CLIENT_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidVoteClientId(clientId: string) {
  return VOTE_CLIENT_ID_PATTERN.test(clientId);
}

export function getFallbackVoteCounts(keys: string[]) {
  const counts: Record<string, number> = {};
  for (const key of keys) counts[key] = 0;
  return counts;
}

export function getFallbackClientVotes(keys: string[]) {
  const voted: Record<string, boolean> = {};
  for (const key of keys) voted[key] = false;
  return voted;
}
