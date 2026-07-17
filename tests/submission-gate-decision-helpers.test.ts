import { describe, expect, it } from "vitest";

import {
  checksForDecision,
  decisionStatus,
  gateCheckStatus,
  isTimeoutError,
  retryDelayForMergeError,
  truncateForQueue,
} from "../apps/submission-gate/src/decisions";
import { GitHubApiError } from "../apps/submission-gate/src/github";

describe("submission-gate truncateForQueue", () => {
  it("blanks nullish values and trims short text", () => {
    expect(truncateForQueue(null)).toBe("");
    expect(truncateForQueue(undefined)).toBe("");
    expect(truncateForQueue("  hi  ")).toBe("hi");
  });

  it("coerces non-string values", () => {
    expect(truncateForQueue(42)).toBe("42");
  });

  it("caps over-long text with an ellipsis", () => {
    const truncated = truncateForQueue("x".repeat(600));
    expect(truncated).toHaveLength(500);
    expect(truncated.endsWith("...")).toBe(true);
  });

  it("honors a custom max length", () => {
    expect(truncateForQueue("abcdefghij", 5)).toBe("ab...");
  });
});

describe("submission-gate decisionStatus", () => {
  it("maps every verdict to its queue status", () => {
    expect(decisionStatus("merge")).toBe("merge_pending");
    expect(decisionStatus("manual")).toBe("manual");
    expect(decisionStatus("ignore")).toBe("ignored");
    expect(decisionStatus("close")).toBe("closed");
  });
});

describe("submission-gate gateCheckStatus", () => {
  it("treats missing as pending and normalizes known statuses", () => {
    expect(gateCheckStatus("MISSING")).toBe("pending");
    expect(gateCheckStatus("Passed")).toBe("passed");
    expect(gateCheckStatus("skipped")).toBe("skipped");
  });

  it("falls back to unknown for unrecognized statuses", () => {
    expect(gateCheckStatus("weird")).toBe("unknown");
  });
});

describe("submission-gate checksForDecision", () => {
  it("returns an empty list without validation checks", () => {
    expect(checksForDecision(null)).toEqual([]);
    expect(checksForDecision(undefined)).toEqual([]);
    expect(checksForDecision({})).toEqual([]);
  });

  it("normalizes each check status and keeps details", () => {
    expect(
      checksForDecision({
        checks: [
          { name: "a", status: "missing" },
          { name: "b", status: "zz", details: "d" },
        ],
      }),
    ).toEqual([
      { name: "a", status: "pending", details: undefined },
      { name: "b", status: "unknown", details: "d" },
    ]);
  });
});

describe("submission-gate isTimeoutError", () => {
  it("ignores non-errors and unrelated errors", () => {
    expect(isTimeoutError("timed out")).toBe(false);
    expect(isTimeoutError(new Error("boom"))).toBe(false);
  });

  it("detects abort names and timeout messages", () => {
    const aborted = new Error("m");
    aborted.name = "AbortError";
    expect(isTimeoutError(aborted)).toBe(true);
    expect(isTimeoutError(new Error("The operation timed out"))).toBe(true);
  });
});

describe("submission-gate retryDelayForMergeError", () => {
  it("backs off further for a 429 than for a generic merge error", () => {
    const rateLimited = retryDelayForMergeError(
      new GitHubApiError(429, "too many requests"),
    );
    const generic = retryDelayForMergeError(new Error("merge conflict"));
    expect(rateLimited).toBeGreaterThan(generic);
  });
});
