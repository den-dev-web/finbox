import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboard } from "../../src/js/data/api.js";

const DATA = { periods: { month: { metrics: { income: 1 } } } };

const mockFetch = (response) =>
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

const setSearch = (search) => vi.stubGlobal("window", { location: { search } });

// getDashboard waits a random 300–800 ms to simulate latency
const run = async (period) => {
  const result = getDashboard(period);
  // Mark the rejection as handled while timers run; the caller still awaits it
  result.catch(() => {});
  await vi.runAllTimersAsync();
  return result;
};

beforeEach(() => {
  vi.useFakeTimers();
  setSearch("");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("getDashboard", () => {
  it("returns the data of the requested period", async () => {
    mockFetch({ ok: true, json: async () => DATA });
    await expect(run("month")).resolves.toEqual(DATA.periods.month);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/data\/finbox\.mock\.json$/),
    );
  });

  it("rejects an unknown period", async () => {
    mockFetch({ ok: true, json: async () => DATA });
    await expect(run("decade")).rejects.toThrow("Unknown period");
  });

  it("fails on purpose with ?fail=1 without requesting data", async () => {
    setSearch("?fail=1");
    mockFetch({ ok: true, json: async () => DATA });
    await expect(run("month")).rejects.toThrow("Mock request failed");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("explains a missing data file", async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(run("month")).rejects.toThrow("Mock data file not found");
  });

  it("keeps the network error as the cause", async () => {
    const networkError = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));
    await expect(run("month")).rejects.toMatchObject({ cause: networkError });
  });
});
