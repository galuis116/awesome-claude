import { describe, expect, it } from "vitest";

import {
  monogramHue,
  monogramInitials,
} from "../apps/web/src/lib/monogram-lib";

describe("monogramInitials", () => {
  it("uses the first two letters of a single-word name", () => {
    expect(monogramInitials("Anthropic")).toBe("AN");
  });

  it("uses first + last word initials for a multi-word name", () => {
    expect(monogramInitials("Model Context Protocol")).toBe("MP");
  });

  it("collapses surrounding and repeated whitespace", () => {
    expect(monogramInitials("  John   Doe  ")).toBe("JD");
  });

  it("uppercases lowercase input", () => {
    expect(monogramInitials("git")).toBe("GI");
  });

  it("handles a single character", () => {
    expect(monogramInitials("x")).toBe("X");
  });
});

describe("monogramHue", () => {
  it("is deterministic for the same name", () => {
    expect(monogramHue("Anthropic")).toBe(monogramHue("Anthropic"));
  });

  it("stays within the -30..30 range for varied inputs", () => {
    for (const name of [
      "",
      "a",
      "Anthropic",
      "Model Context Protocol",
      "🙂 emoji",
      "12345",
    ]) {
      const hue = monogramHue(name);
      expect(hue).toBeGreaterThanOrEqual(-30);
      expect(hue).toBeLessThanOrEqual(30);
    }
  });

  it("generally differs between unrelated names", () => {
    expect(monogramHue("Anthropic")).not.toBe(monogramHue("OpenAI"));
  });
});
