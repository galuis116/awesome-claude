import { describe, expect, it } from "vitest";

import {
  sourceEvidenceCloseDecision,
  sourceEvidenceSummary,
  sourceEvidenceToDecisionEvidence,
  type SourceEvidenceReport,
} from "../apps/submission-gate/src/source-evidence";

function report(urls: SourceEvidenceReport["urls"]): SourceEvidenceReport {
  return { status: "failed", hash: "source-hash", warnings: [], urls };
}

const deadRepo = {
  field: "repoUrl",
  url: "https://github.com/example/missing",
  status: "hard_failure" as const,
  role: "canonical" as const,
  blocking: true,
  outcome: "http_hard_failure",
  httpStatus: 404,
  finalUrl: "https://github.com/example/missing",
};

const deadSource = {
  field: "sourceUrl",
  url: "https://example.com/missing",
  status: "hard_failure" as const,
  role: "canonical" as const,
  blocking: true,
  outcome: "http_hard_failure",
  httpStatus: 410,
  finalUrl: "https://example.com/missing",
};

describe("submission-gate sourceEvidenceCloseDecision hard-close threshold", () => {
  it("closes when two or more authoritative sources all hard-failed", () => {
    const decision = sourceEvidenceCloseDecision(
      report([deadRepo, deadSource]),
    );
    expect(decision).toMatchObject({
      verdict: "close",
      close: true,
      reasonCode: "source_hard_failure",
    });
    expect(decision?.summary).toContain(
      "Close this PR and resubmit with reachable, authoritative source URLs.",
    );
  });

  it("stays manual when there is only a single authoritative source, even if it hard-failed", () => {
    const decision = sourceEvidenceCloseDecision(report([deadRepo]));
    expect(decision).toMatchObject({
      verdict: "manual",
      close: false,
      reasonCode: "source_hard_failure",
    });
  });
});

describe("submission-gate sourceEvidenceSummary formatting", () => {
  it("reports that no source URLs were declared when the list is empty", () => {
    expect(sourceEvidenceSummary(report([]))).toBe(
      "No source URLs were declared.",
    );
  });

  it("prefers the HTTP status over the outcome and flags non-blocking warnings", () => {
    const passedWithStatus = { ...deadRepo, status: "passed" as const };
    const noStatusItem = {
      ...deadRepo,
      httpStatus: undefined,
      blocking: false,
    };
    const summary = sourceEvidenceSummary(
      report([passedWithStatus, noStatusItem]),
    );
    expect(summary).toContain("HTTP 404");
    expect(summary).toContain("http_hard_failure");
    expect(summary).toContain("(non-blocking source-inconclusive warning)");
  });
});

describe("submission-gate sourceEvidenceToDecisionEvidence behavior text", () => {
  it("describes the failure by HTTP status when one was recorded", () => {
    const evidence = sourceEvidenceToDecisionEvidence(report([deadRepo]));
    expect(evidence).toEqual([
      expect.objectContaining({
        behavior: "repoUrl returned HTTP 404",
        httpStatus: "404",
      }),
    ]);
  });

  it("describes the failure generically when there is no HTTP status", () => {
    const noStatusItem = { ...deadRepo, httpStatus: undefined };
    const evidence = sourceEvidenceToDecisionEvidence(report([noStatusItem]));
    expect(evidence).toEqual([
      expect.objectContaining({
        behavior: "repoUrl is not a valid reachable source URL",
        httpStatus: undefined,
      }),
    ]);
  });
});
