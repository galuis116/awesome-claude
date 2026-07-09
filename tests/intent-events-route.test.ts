import { beforeEach, describe, expect, it, vi } from "vitest";

const getSiteDbMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({
  getSiteDb: getSiteDbMock,
}));

function jsonRequest(body: Record<string, unknown>) {
  return new Request("https://heyclau.de/api/intent-events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://heyclau.de",
    },
    body: JSON.stringify(body),
  });
}

/** A fake D1 that records the values bound to the INSERT. */
function recordingDb(boundCalls: unknown[][]) {
  return {
    prepare: () => ({
      bind: (...values: unknown[]) => {
        boundCalls.push(values);
        return { run: async () => ({ success: true }) };
      },
    }),
  };
}

/** A fake D1 whose write always fails, standing in for a D1 outage. */
function failingDb() {
  return {
    prepare: () => ({
      bind: () => ({
        run: async () => {
          throw new Error("D1_ERROR: network failure");
        },
      }),
    }),
  };
}

const post = async (body: Record<string, unknown>) => {
  const { POST } = await import("@/routes/api/intent-events");
  return POST(jsonRequest(body));
};

describe("POST /api/intent-events degradation", () => {
  beforeEach(() => {
    getSiteDbMock.mockReset();
  });

  it("still answers 200 when the D1 write throws, so a CTA never surfaces an error", async () => {
    getSiteDbMock.mockReturnValue(failingDb());

    const response = await post({
      type: "copy",
      entryKey: "skills:example-skill",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      stored: false,
      reason: "insert_failed",
    });
  });

  it("reports the event as stored on a successful write", async () => {
    getSiteDbMock.mockReturnValue(recordingDb([]));

    const response = await post({ type: "install", entryKey: "mcp:example" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
  });
});

describe("POST /api/intent-events payload hygiene", () => {
  let bound: unknown[][];

  beforeEach(() => {
    bound = [];
    getSiteDbMock.mockReset();
    getSiteDbMock.mockReturnValue(recordingDb(bound));
  });

  // bind order: (event_type, entry_key, session_id)
  const sessionIdOf = (calls: unknown[][]) => calls[0][2];

  it("persists an opaque session id verbatim", async () => {
    await post({ type: "copy", entryKey: "skills:a", sessionId: "hc-9aF_x-1" });
    expect(sessionIdOf(bound)).toBe("hc-9aF_x-1");
  });

  it("never persists an email as a session id", async () => {
    await post({
      type: "copy",
      entryKey: "skills:a",
      sessionId: "user@example.com",
    });
    expect(sessionIdOf(bound)).toBeNull();
  });

  it("never persists a credential or URL as a session id", async () => {
    await post({
      type: "open",
      entryKey: "skills:a",
      sessionId: "https://heyclau.de/u/1?token=abc",
    });
    expect(sessionIdOf(bound)).toBeNull();
  });

  it("still records the event when the session id is dropped", async () => {
    const response = await post({
      type: "copy",
      entryKey: "skills:a",
      sessionId: "Ada Lovelace",
    });

    await expect(response.json()).resolves.toEqual({ ok: true, stored: true });
    expect(bound).toHaveLength(1);
    expect(bound[0][0]).toBe("copy");
    expect(bound[0][1]).toBe("skills:a");
    expect(sessionIdOf(bound)).toBeNull();
  });

  it("binds NULL rather than an empty string for a missing entry key", async () => {
    await post({ type: "copy" });
    expect(bound[0][1]).toBeNull();
  });
});
