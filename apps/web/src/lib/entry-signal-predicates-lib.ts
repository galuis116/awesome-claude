/**
 * Pure entry trust-signal predicates.
 *
 * Canonical presence checks for the trust evidence surfaced across browse,
 * compare, and entry-detail decision helpers. Each predicate accepts the
 * narrowest `Entry` slice it needs so callers can pass partial fixtures, and
 * the results are derived purely from the entry metadata passed in.
 */

import type { Entry } from "@/types/registry";

export function hasSafetySignal(entry: Pick<Entry, "safetyNotes" | "safetyNotesList">): boolean {
  return Boolean(entry.safetyNotes || entry.safetyNotesList?.length);
}

export function hasPrivacySignal(entry: Pick<Entry, "privacyNotes" | "privacyNotesList">): boolean {
  return Boolean(entry.privacyNotes || entry.privacyNotesList?.length);
}

export function hasSourceSignal(entry: Pick<Entry, "source" | "sourceUrl">): boolean {
  return entry.source !== "unverified" || Boolean(entry.sourceUrl);
}

export function hasReviewedSignal(entry: Pick<Entry, "reviewed" | "reviewedBy">): boolean {
  return Boolean(entry.reviewed || entry.reviewedBy);
}

export function hasPackageSignal(
  entry: Pick<Entry, "packageVerified" | "downloadSha256">,
): boolean {
  return entry.packageVerified === true || Boolean(entry.downloadSha256);
}

export function hasInstallPayloadSignal(
  entry: Pick<Entry, "installCommand" | "configSnippet" | "fullCopy" | "copySnippet">,
): boolean {
  return Boolean(
    entry.installCommand || entry.configSnippet || entry.fullCopy || entry.copySnippet,
  );
}
