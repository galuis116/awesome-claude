import { describe, expect, it } from "vitest";

import type {
  MatrixClient,
  MatrixRow,
  Support,
} from "../apps/web/src/components/compatibility-matrix";
import { buildCompatibilityCsv } from "../apps/web/src/lib/compatibility-matrix-csv-lib";

const clients: MatrixClient[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "desktop", label: "Desktop" },
];

const label = (support: Support) =>
  ({
    native: "Native",
    adapter: "Adapter",
    manual: "Manual",
    none: "Unsupported",
  })[support];

describe("buildCompatibilityCsv", () => {
  it("emits a header of Capability, Detail, then each client label", () => {
    const csv = buildCompatibilityCsv(clients, [], label);
    expect(csv.split("\n")[0]).toBe("Capability,Detail,Claude Code,Desktop");
  });

  it("resolves each client cell through labelFor", () => {
    const rows: MatrixRow[] = [
      {
        capability: "Tools",
        blurb: "Call tools",
        cells: { "claude-code": "native", desktop: "adapter" },
      },
    ];
    const csv = buildCompatibilityCsv(clients, rows, label);
    expect(csv).toBe(
      "Capability,Detail,Claude Code,Desktop\nTools,Call tools,Native,Adapter\n",
    );
  });

  it("escapes commas and quotes in capability and blurb cells", () => {
    const rows: MatrixRow[] = [
      {
        capability: 'MCP, "stdio"',
        blurb: "one, two",
        cells: { "claude-code": "manual", desktop: "none" },
      },
    ];
    const csv = buildCompatibilityCsv(clients, rows, label);
    const dataLine = csv.split("\n")[1];
    expect(dataLine).toBe('"MCP, ""stdio""","one, two",Manual,Unsupported');
  });

  it("emits one line per row and always ends with a trailing newline", () => {
    const rows: MatrixRow[] = [
      {
        capability: "A",
        blurb: "a",
        cells: { "claude-code": "native", desktop: "native" },
      },
      {
        capability: "B",
        blurb: "b",
        cells: { "claude-code": "none", desktop: "none" },
      },
    ];
    const csv = buildCompatibilityCsv(clients, rows, label);
    expect(csv.endsWith("\n")).toBe(true);
    expect(csv.trimEnd().split("\n")).toHaveLength(3); // header + 2 rows
  });

  it("produces a header-only document (with trailing newlines) for no rows", () => {
    expect(buildCompatibilityCsv(clients, [], label)).toBe(
      "Capability,Detail,Claude Code,Desktop\n\n",
    );
  });
});
