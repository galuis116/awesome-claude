import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import {
  consumeDraftUserToken,
  createDraft,
  getDraftUserToken,
  insertAudit,
  storeDraftUserToken,
  updateDraftStatus,
  upsertPrState,
} from "../apps/submission-gate/src/storage";

type QueryCall = {
  sql: string;
  binds: unknown[];
};

function createFakeDb(
  options: {
    first?: unknown[];
    all?: unknown[];
    run?: unknown[];
  } = {},
) {
  const calls: QueryCall[] = [];
  const first = [...(options.first ?? [])];
  const all = [...(options.all ?? [])];
  const run = [...(options.run ?? [])];
  const db = {
    prepare(sql: string) {
      const call: QueryCall = { sql, binds: [] };
      calls.push(call);
      return {
        bind(...binds: unknown[]) {
          call.binds = binds;
          return this;
        },
        async run() {
          return run.shift() ?? { meta: { changes: 1 } };
        },
        async first() {
          return first.shift() ?? null;
        },
        async all() {
          return all.shift() ?? { results: [] };
        },
      };
    },
  };
  return { db: db as unknown as D1Database, calls };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("submission-gate storage optional-field defaults", () => {
  it("stores a null auth-state hash when no auth state is supplied", async () => {
    const { db, calls } = createFakeDb();
    await createDraft(db, {
      id: "draft_1",
      status: "draft",
      category: "mcp",
      slug: "example",
      targetPath: "content/mcp/example.mdx",
      branchName: "heyclaude/submit-mcp-example",
      baseRef: "main",
      fields: { title: "Example" },
    });
    expect(calls[0].binds).toContain(null);
    expect(calls[0].binds).not.toContain(undefined);
  });

  it("defaults the user token expiry to 900 seconds when no ttl is given", async () => {
    const { db, calls } = createFakeDb();
    await storeDraftUserToken(db, {
      draftId: "draft_1",
      encryptedToken: "encrypted-token",
    });
    expect(calls[0].binds).toContain("2026-01-01T00:15:00.000Z");
  });

  it("returns null when no unconsumed user token row is found", async () => {
    const { db } = createFakeDb({ first: [null, null] });
    await expect(consumeDraftUserToken(db, "draft_1")).resolves.toBeNull();
    await expect(getDraftUserToken(db, "draft_1")).resolves.toBeNull();
  });

  it("coalesces every optional draft-status field to null when omitted", async () => {
    const { db, calls } = createFakeDb();
    await updateDraftStatus(db, "draft_1", "submitted");
    expect(calls[0].binds).toEqual([
      "submitted",
      null,
      null,
      null,
      null,
      null,
      null,
      "2026-01-01T00:00:00.000Z",
      "draft_1",
    ]);
  });

  it("uses an explicitly provided terminalAt instead of deriving one from status", async () => {
    const { db, calls } = createFakeDb();
    await upsertPrState(db, {
      repo: "JSONbored/awesome-claude",
      number: 1,
      baseRef: "main",
      status: "queued",
      terminalAt: "2025-06-01T00:00:00.000Z",
    });
    // terminalAt is the 17th positional bind in the INSERT values list.
    expect(calls[0].binds[16]).toBe("2025-06-01T00:00:00.000Z");
  });

  it("coalesces optional audit fields to null when omitted", async () => {
    const { db, calls } = createFakeDb();
    await insertAudit(db, {
      id: "audit-1",
      targetKey: "JSONbored/awesome-claude#42",
      eventType: "decision",
    });
    expect(calls[0].binds).toEqual([
      "audit-1",
      "JSONbored/awesome-claude#42",
      "decision",
      null,
      null,
      null,
      "2026-01-01T00:00:00.000Z",
    ]);
  });
});
