// Pure helpers for the download API route: validate the requested asset path
// against the allowlist, resolve its content type, and derive a filename. Split
// out of the route so the guards/mappings can be unit-tested without the handler.

/** True only for allow-listed skill (.zip) and mcp (.mcpb) download paths. */
export function isAllowedAssetPath(asset: string): boolean {
  const normalized = String(asset || "").trim();
  return (
    /^\/downloads\/skills\/[a-z0-9-]+\.zip$/.test(normalized) ||
    /^\/downloads\/mcp\/[a-z0-9-]+\.mcpb$/.test(normalized)
  );
}

/** Content-type for a download asset, defaulting to a binary stream. */
export function getContentType(asset: string): string {
  if (asset.endsWith(".zip")) return "application/zip";
  if (asset.endsWith(".mcpb")) return "application/octet-stream";
  return "application/octet-stream";
}

/** Last path segment of an asset, falling back to "download". */
export function filenameFromAsset(asset: string): string {
  return asset.split("/").filter(Boolean).at(-1) || "download";
}
