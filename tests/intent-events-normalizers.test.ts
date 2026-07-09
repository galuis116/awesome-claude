import { describe, expect, it } from "vitest";

import {
  normalizeIntentEventType,
  normalizeIntentEntryKey,
  normalizeIntentSessionId,
  getFallbackIntentEventCounts,
  ZERO_INTENT_EVENT_COUNTS,
} from "@/lib/intent-events";

describe("normalizeIntentEventType", () => {
  it("accepts the known event vocabulary, lowercasing and trimming first", () => {
    expect(normalizeIntentEventType("copy")).toBe("copy");
    // Input is trimmed and lowercased before the vocabulary check.
    expect(normalizeIntentEventType(" INSTALL ")).toBe("install");
  });

  it("returns an empty string for unknown or nullish types", () => {
    // An empty string is the sentinel the caller treats as "no valid event".
    expect(normalizeIntentEventType("xxx")).toBe("");
    expect(normalizeIntentEventType(null)).toBe("");
    expect(normalizeIntentEventType(undefined)).toBe("");
  });
});

describe("normalizeIntentEntryKey", () => {
  it("accepts a lowercased category:slug key", () => {
    expect(normalizeIntentEntryKey("agents:my-slug")).toBe("agents:my-slug");
    expect(normalizeIntentEntryKey("Agents:My-Slug")).toBe("agents:my-slug");
  });

  it("rejects keys without the single-colon category:slug shape", () => {
    // A slash path or missing colon is not a valid intent entry key.
    expect(normalizeIntentEntryKey("agents/my-slug")).toBe("");
    expect(normalizeIntentEntryKey("agents")).toBe("");
  });
});

describe("normalizeIntentSessionId", () => {
  it("trims and accepts ids up to 128 characters", () => {
    expect(normalizeIntentSessionId("  abc123  ")).toBe("abc123");
    expect(normalizeIntentSessionId("a".repeat(128))).toHaveLength(128);
  });

  it("rejects ids longer than 128 characters", () => {
    // Oversized ids are dropped rather than stored unbounded.
    expect(normalizeIntentSessionId("x".repeat(129))).toBe("");
  });

  it("accepts the opaque URL-safe token alphabet", () => {
    expect(normalizeIntentSessionId("hc-9aF_x-1")).toBe("hc-9aF_x-1");
    expect(normalizeIntentSessionId("session-0")).toBe("session-0");
  });

  it("keeps personal data out of session_id", () => {
    // An email, a name with spaces, or non-ASCII free text is not an opaque token.
    expect(normalizeIntentSessionId("user@example.com")).toBe("");
    expect(normalizeIntentSessionId("Ada Lovelace")).toBe("");
    expect(normalizeIntentSessionId("józef")).toBe("");
  });

  it("rejects credentials and URLs that would otherwise be persisted verbatim", () => {
    // A JWT is dot-separated, so the dot alone disqualifies it.
    expect(normalizeIntentSessionId("eyJhbGci.eyJzdWIi.SflKxwRJ")).toBe("");
    expect(normalizeIntentSessionId("https://heyclau.de/u/1?token=abc")).toBe(
      "",
    );
    expect(normalizeIntentSessionId('{"email":"a@b.c"}')).toBe("");
  });

  it("returns the empty sentinel for nullish input", () => {
    expect(normalizeIntentSessionId(null)).toBe("");
    expect(normalizeIntentSessionId(undefined)).toBe("");
    expect(normalizeIntentSessionId("")).toBe("");
  });
});

describe("getFallbackIntentEventCounts", () => {
  it("seeds a zeroed count record for each requested key", () => {
    const counts = getFallbackIntentEventCounts(["agents:a", "mcp:b"]);
    expect(counts["agents:a"]).toEqual(ZERO_INTENT_EVENT_COUNTS);
    expect(counts["mcp:b"]).toEqual(ZERO_INTENT_EVENT_COUNTS);
  });

  it("gives each key an independent counts object", () => {
    // Mutating one key's counts must not bleed into another key.
    const counts = getFallbackIntentEventCounts(["a:1", "b:2"]);
    counts["a:1"].copy = 5;
    expect(counts["b:2"].copy).toBe(0);
  });
});
