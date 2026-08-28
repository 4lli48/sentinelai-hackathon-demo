import { afterEach, describe, expect, it, vi } from "vitest";

async function readConnectionStatus(url: string, serviceRoleKey: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${url}/rest/v1/Customer?select=id&limit=1`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "count=exact",
        },
        signal: AbortSignal.timeout(9_000),
      });
      if ([200, 206].includes(response.status)) return response.status;
      lastError = new Error(`Unexpected Supabase status: ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw lastError;
}

afterEach(() => vi.unstubAllGlobals());

describe("Supabase server-only connection contract", () => {
  it("builds a read-only request with server-only credentials", async () => {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(url).toMatch(/^https:\/\//);
    expect(serviceRoleKey).toBeTruthy();

    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const status = await readConnectionStatus(url!, serviceRoleKey!);
    expect([200, 206]).toContain(status);
    expect(fetchMock).toHaveBeenCalledWith(`${url}/rest/v1/Customer?select=id&limit=1`, expect.objectContaining({
      signal: expect.any(AbortSignal),
      headers: expect.objectContaining({
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
      }),
    }));
  });
});
