import { describe, expect, it } from "vitest";

import {
  GATE_DECISION_SCHEMA_VERSION,
  isRetryableGateDecision,
  normalizePrivateGateDecisionPayload,
  parsePrivateGateDecisionResponseBody,
  privateReviewErrorDecision,
} from "../apps/submission-gate/src/review";

const validV2Payload = {
  schemaVersion: GATE_DECISION_SCHEMA_VERSION,
  verdict: "close" as const,
  confidence: 0.9,
  summary: "Closing this submission.",
  checks: [{ name: "validate-content", status: "passed" }],
  sections: [
    { id: "source", title: "Source", status: "info", bullets: ["b1"] },
  ],
};

describe("submission-gate close-evidence contract (GateDecisionV2)", () => {
  it("rejects a close verdict with no reasonCode", () => {
    const result = normalizePrivateGateDecisionPayload(validV2Payload);
    expect(result.decision).toBeUndefined();
    expect(result.error).toMatchObject({
      code: "invalid_private_response",
      message: expect.stringContaining("supported reasonCode"),
    });
  });

  it("rejects a close verdict whose reasonCode has no concrete evidence", () => {
    const result = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      reasonCode: "source_hard_failure",
    });
    expect(result.error?.message).toContain("public-safe evidence");

    const emptyEvidence = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      reasonCode: "source_hard_failure",
      evidence: [{ ruleId: "x" }], // no concrete-detail field populated
    });
    expect(emptyEvidence.error?.message).toContain("public-safe evidence");
  });

  it("rejects a strict_duplicate close that doesn't identify the duplicated entry", () => {
    const result = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      reasonCode: "strict_duplicate",
      evidence: [{ behavior: "looks similar to another entry" }],
    });
    expect(result.error?.message).toContain(
      "must identify the duplicated entry path, source URL, or PR",
    );
  });

  it("accepts a strict_duplicate close that points at the duplicated content path", () => {
    const result = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      reasonCode: "strict_duplicate",
      evidence: [{ duplicatePath: "content/mcp/existing.mdx" }],
    });
    expect(result.error).toBeUndefined();
    expect(result.decision?.reasonCode).toBe("strict_duplicate");
  });

  it("rejects a safety close missing ruleId, matched behavior, or a defensive assessment", () => {
    const base = {
      ...validV2Payload,
      reasonCode: "embedded_secret" as const,
    };
    expect(
      normalizePrivateGateDecisionPayload({
        ...base,
        evidence: [
          { snippet: "AKIA...", whyNotDefensive: "not a placeholder" },
        ],
      }).error?.message,
    ).toContain("ruleId, matched behavior, and whyNotDefensive");
    expect(
      normalizePrivateGateDecisionPayload({
        ...base,
        evidence: [
          { ruleId: "secret-scan", whyNotDefensive: "not a placeholder" },
        ],
      }).error?.message,
    ).toContain("ruleId, matched behavior, and whyNotDefensive");
    expect(
      normalizePrivateGateDecisionPayload({
        ...base,
        evidence: [{ ruleId: "secret-scan", snippet: "AKIA..." }],
      }).error?.message,
    ).toContain("ruleId, matched behavior, and whyNotDefensive");
  });

  it("accepts a complete safety close with ruleId, matched behavior, and a defensive assessment", () => {
    const result = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      reasonCode: "embedded_secret",
      evidence: [
        {
          ruleId: "secret-scan",
          snippet: "AKIA...",
          whyNotDefensive: "matches a live-looking AWS key format",
        },
      ],
    });
    expect(result.error).toBeUndefined();
    expect(result.decision?.verdict).toBe("close");
  });

  it("does not require close-contract evidence for non-close verdicts", () => {
    const result = normalizePrivateGateDecisionPayload({
      ...validV2Payload,
      verdict: "manual",
    });
    expect(result.error).toBeUndefined();
    expect(result.decision?.verdict).toBe("manual");
  });
});

describe("submission-gate private payload unwrapping", () => {
  it("unwraps a decision nested under decision/gateDecision/result/review keys", () => {
    for (const key of ["decision", "gateDecision", "result", "review"]) {
      const result = normalizePrivateGateDecisionPayload({
        [key]: validV2Payload,
      });
      // Nested close-without-evidence still fails the contract, proving the
      // nested payload was actually unwrapped and validated.
      expect(result.error?.message).toContain("supported reasonCode");
    }
  });

  it("parses a JSON-stringified payload before unwrapping it", () => {
    expect(
      parsePrivateGateDecisionResponseBody(JSON.stringify(validV2Payload)),
    ).toMatchObject({ verdict: "close" });
  });

  it("passes through a non-JSON string body unchanged", () => {
    expect(parsePrivateGateDecisionResponseBody("not json")).toBe("not json");
  });

  it("stops unwrapping after a bounded depth instead of recursing forever", () => {
    let payload: unknown = { verdict: "manual" };
    for (let i = 0; i < 10; i += 1) payload = { decision: payload };
    // Should not throw or hang; eventually treats the still-wrapped object as
    // an invalid payload once the unwrap depth budget is exhausted.
    expect(() => normalizePrivateGateDecisionPayload(payload)).not.toThrow();
  });
});

describe("submission-gate schema version handling", () => {
  it("rejects an unsupported explicit schema version", () => {
    const result = normalizePrivateGateDecisionPayload({
      schemaVersion: 999,
      verdict: "manual",
    });
    expect(result.error?.message).toContain("unsupported schema version");
  });
});

describe("submission-gate legacy (v1) payload handling", () => {
  it("rejects an unrecognized v1 verdict", () => {
    const result = normalizePrivateGateDecisionPayload({
      verdict: "not-a-real-verdict",
    });
    expect(result.error?.code).toBe("invalid_private_response");
  });

  it("accepts a recognized v1 verdict without schemaVersion", () => {
    const result = normalizePrivateGateDecisionPayload({
      verdict: "manual",
      summary: "Legacy manual review.",
    });
    expect(result.error).toBeUndefined();
    expect(result.decision?.verdict).toBe("manual");
  });

  it("rejects a v1 close with a generic safety-sounding summary but no evidence", () => {
    const result = normalizePrivateGateDecisionPayload({
      verdict: "close",
      summary:
        "This matched pattern is concrete enough to fail hard safety checks.",
    });
    expect(result.error?.message).toContain("public-safe evidence");
  });

  it("accepts a v1 close that has a reasonCode even without a safety-sounding summary", () => {
    const result = normalizePrivateGateDecisionPayload({
      verdict: "close",
      summary: "Not a fit for the directory.",
      reasonCode: "policy_fit_failure",
    });
    expect(result.error).toBeUndefined();
    expect(result.decision?.reasonCode).toBe("policy_fit_failure");
  });
});

describe("submission-gate retryable decision helpers", () => {
  it("treats only manual decisions with a retryable-coded error as retryable", () => {
    expect(
      isRetryableGateDecision({
        verdict: "manual",
        summary: "s",
        labels: [],
        errors: [{ code: "github_rate_limited" }],
      }),
    ).toBe(true);
    expect(
      isRetryableGateDecision({
        verdict: "manual",
        summary: "s",
        labels: [],
        errors: [{ code: "not_retryable_code", retryable: false }],
      }),
    ).toBe(false);
    expect(
      isRetryableGateDecision({
        verdict: "close",
        summary: "s",
        labels: [],
        errors: [{ code: "github_rate_limited" }],
      }),
    ).toBe(false);
  });

  it("builds a manual decision carrying the retryable error", () => {
    const decision = privateReviewErrorDecision(
      "Timed out.",
      "source_evidence_timeout",
    );
    expect(decision.verdict).toBe("manual");
    expect(decision.errors).toEqual([
      {
        code: "source_evidence_timeout",
        retryable: true,
        message: "Timed out.",
      },
    ]);
  });
});
