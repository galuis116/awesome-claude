import { describe, expect, it } from "vitest";

import { buildRaycastDetailMarkdown } from "../packages/registry/src/artifacts-lib.js";

const baseEntry = {
  title: "Demo Skill",
  description: "A demo entry used for Raycast detail markdown coverage.",
  category: "skills",
};

function trustLines(markdown: string) {
  return markdown.split("\n").filter((line) => line.startsWith("- "));
}

describe("artifacts-lib buildRaycastDetailMarkdown trust section", () => {
  it("reports missing source, package, and review metadata", () => {
    const markdown = buildRaycastDetailMarkdown(baseEntry);
    expect(markdown).toContain("# Demo Skill");
    expect(trustLines(markdown)).toEqual([
      "- Source: source not provided",
      "- Package: no package download",
      "- Review: unclaimed",
    ]);
  });

  it("labels a download-only entry as an external package", () => {
    expect(
      trustLines(
        buildRaycastDetailMarkdown({
          ...baseEntry,
          downloadUrl: "https://example.com/demo.zip",
        }),
      ),
    ).toContain("- Package: external package");
  });

  it("credits a repo source, verified package, and reviewer", () => {
    expect(
      trustLines(
        buildRaycastDetailMarkdown({
          ...baseEntry,
          repoUrl: "https://github.com/example/demo",
          packageVerified: true,
          reviewedBy: "maintainer",
        }),
      ),
    ).toEqual([
      "- Source: source-backed",
      "- Package: maintainer-built/verified package",
      "- Review: reviewed or claimed",
    ]);
  });

  it("credits docs source, first-party trust, and a verified claim", () => {
    expect(
      trustLines(
        buildRaycastDetailMarkdown({
          ...baseEntry,
          documentationUrl: "https://example.com/docs",
          downloadTrust: "first-party",
          claimStatus: "verified",
        }),
      ),
    ).toEqual([
      "- Source: source-backed",
      "- Package: maintainer-built/verified package",
      "- Review: reviewed or claimed",
    ]);
  });
});

describe("artifacts-lib buildRaycastDetailMarkdown sections", () => {
  it("renders notes, install, config, and usage sections", () => {
    const markdown = buildRaycastDetailMarkdown({
      ...baseEntry,
      safetyNotes: ["runs user code"],
      privacyNotes: ["reads local files"],
      commandSyntax: "/demo <input>",
      configSnippet: '{"a":1}',
      usageSnippet: "Use it during review.",
    });
    expect(markdown).toContain("## Safety notes\n- runs user code");
    expect(markdown).toContain("## Privacy notes\n- reads local files");
    expect(markdown).toContain("## Install\n```bash\n/demo <input>\n```");
    expect(markdown).toContain('## Config\n```json\n{"a":1}\n```');
    expect(markdown).toContain("## Usage\nUse it during review.");
  });

  it("prefers installCommand over commandSyntax and skips blank notes", () => {
    const markdown = buildRaycastDetailMarkdown({
      ...baseEntry,
      installCommand: "npx -y demo",
      commandSyntax: "/demo <input>",
      safetyNotes: ["   ", ""],
      privacyNotes: "not-an-array",
    });
    expect(markdown).toContain("## Install\n```bash\nnpx -y demo\n```");
    expect(markdown).not.toContain("## Safety notes");
    expect(markdown).not.toContain("## Privacy notes");
  });

  it("omits optional sections when the entry carries none", () => {
    const markdown = buildRaycastDetailMarkdown(baseEntry);
    expect(markdown).not.toContain("## Install");
    expect(markdown).not.toContain("## Config");
    expect(markdown).not.toContain("## Usage");
  });
});
