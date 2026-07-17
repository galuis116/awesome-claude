import { describe, expect, it } from "vitest";

import { buildDiscordDecisionPayload } from "../apps/submission-gate/src/notifications";

const base = {
  repoFullName: "JSONbored/awesome-claude",
  prNumber: 300,
  verdict: "merge" as const,
  now: new Date("2026-01-01T00:00:00.000Z"),
};

describe("submission-gate discord notification rationale sanitizing", () => {
  it("discards the rest of a line after an unterminated HTML comment", () => {
    const payload = buildDiscordDecisionPayload({
      ...base,
      summary: "Before the comment <!-- this never closes",
    });
    expect(payload.embeds[0].description).toBe("Before the comment");
  });
});

describe("submission-gate discord notification live content links", () => {
  it("omits the Live field when the changed file path doesn't match the content pattern", () => {
    const payload = buildDiscordDecisionPayload({
      ...base,
      changedFile: "not-a-valid-content-path.txt",
    });
    expect(payload.embeds[0].fields.map((field) => field.name)).not.toContain(
      "Live",
    );
  });

  it("derives a live link when no category hint is supplied", () => {
    const payload = buildDiscordDecisionPayload({
      ...base,
      changedFile: "content/mcp/example.mdx",
      category: undefined,
    });
    expect(
      payload.embeds[0].fields.find((field) => field.name === "Live")?.value,
    ).toContain("https://heyclau.de/entry/mcp/example");
  });

  it("uses an already-canonical contentUrl as-is without deriving one from the changed file", () => {
    const payload = buildDiscordDecisionPayload({
      ...base,
      contentUrl: "https://heyclau.de/entry/mcp/preset",
      changedFile: "content/skills/unrelated.mdx",
      category: "skills",
    });
    expect(
      payload.embeds[0].fields.find((field) => field.name === "Live")?.value,
    ).toContain("https://heyclau.de/entry/mcp/preset");
  });
});

describe("submission-gate discord notification CI summary formatting", () => {
  it("labels a generic passed check and falls back to 'reported' for unrecognized wording", () => {
    const payload = buildDiscordDecisionPayload({
      ...base,
      ciSummary: "lint passed; some other odd check status",
    });
    const checks = payload.embeds[0].fields.find(
      (field) => field.name === "Checks",
    )?.value;
    expect(checks).toContain("lint passed");
    expect(checks).toContain("some other odd check status");
  });
});
