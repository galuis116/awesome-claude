import { describe, expect, it } from "vitest";
import {
  BRIEF_APPROVE_SURFACE,
  briefApproveActionAnalyticsData,
  briefApproveActionAnalyticsEvent,
  briefApproveEgressAnalyticsData,
  briefApproveEgressAnalyticsEvent,
} from "@/lib/brief-approve-cta-events-lib";

describe("brief approve cta events lib", () => {
  it("builds privacy-light brief approve action and egress analytics", () => {
    expect(briefApproveActionAnalyticsEvent()).toBe(
      "brief_approve_action_click",
    );
    expect(briefApproveActionAnalyticsData("approve", "intent", true)).toEqual({
      surface: BRIEF_APPROVE_SURFACE,
      action: "approve",
      outcome: "intent",
      hasNote: true,
    });
    expect(
      briefApproveActionAnalyticsData("approve", "already", false),
    ).toEqual({
      surface: BRIEF_APPROVE_SURFACE,
      action: "approve",
      outcome: "already",
      hasNote: false,
    });
    expect(briefApproveEgressAnalyticsEvent()).toBe(
      "brief_approve_egress_click",
    );
    expect(briefApproveEgressAnalyticsData("brief")).toEqual({
      surface: BRIEF_APPROVE_SURFACE,
      destination: "brief",
    });
  });
});
