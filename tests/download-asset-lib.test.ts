import { describe, expect, it } from "vitest";

import {
  filenameFromAsset,
  getContentType,
  isAllowedAssetPath,
} from "@/lib/download-asset-lib";

describe("isAllowedAssetPath", () => {
  it("accepts allow-listed skill and mcp paths", () => {
    expect(isAllowedAssetPath("/downloads/skills/my-skill.zip")).toBe(true);
    expect(isAllowedAssetPath("  /downloads/mcp/my-server.mcpb  ")).toBe(true);
  });

  it("rejects wrong dirs, extensions, casing, or traversal", () => {
    expect(isAllowedAssetPath("/downloads/skills/my-skill.mcpb")).toBe(false);
    expect(isAllowedAssetPath("/downloads/other/my-skill.zip")).toBe(false);
    expect(isAllowedAssetPath("/downloads/skills/My-Skill.zip")).toBe(false);
    expect(isAllowedAssetPath("/downloads/skills/../etc.zip")).toBe(false);
    expect(isAllowedAssetPath("")).toBe(false);
  });
});

describe("getContentType", () => {
  it("maps zip and mcpb, defaulting to octet-stream", () => {
    expect(getContentType("/downloads/skills/x.zip")).toBe("application/zip");
    expect(getContentType("/downloads/mcp/x.mcpb")).toBe(
      "application/octet-stream",
    );
    expect(getContentType("/downloads/x.bin")).toBe("application/octet-stream");
  });
});

describe("filenameFromAsset", () => {
  it("returns the last path segment", () => {
    expect(filenameFromAsset("/downloads/skills/my-skill.zip")).toBe(
      "my-skill.zip",
    );
  });

  it("falls back to 'download' when there is no segment", () => {
    expect(filenameFromAsset("///")).toBe("download");
    expect(filenameFromAsset("")).toBe("download");
  });
});
