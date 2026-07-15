/**
 * Pure brief approve page navigation analytics helpers.
 *
 * Maps approve CTA and brief egress navigation to privacy-light event names
 * without embedding approval tokens, notes, or schedule timestamps.
 */

export const BRIEF_APPROVE_SURFACE = "brief-approve";

export type BriefApproveAction = "approve";
export type BriefApproveOutcome = "intent" | "success" | "error" | "already";
export type BriefApproveEgressDestination = "brief";

export function briefApproveActionAnalyticsEvent(): string {
  return "brief_approve_action_click";
}

export function briefApproveActionAnalyticsData(
  action: BriefApproveAction,
  outcome: BriefApproveOutcome,
  hasNote: boolean,
) {
  return {
    surface: BRIEF_APPROVE_SURFACE,
    action,
    outcome,
    hasNote,
  };
}

export function briefApproveEgressAnalyticsEvent(): string {
  return "brief_approve_egress_click";
}

export function briefApproveEgressAnalyticsData(destination: BriefApproveEgressDestination) {
  return {
    surface: BRIEF_APPROVE_SURFACE,
    destination,
  };
}
