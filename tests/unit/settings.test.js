import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  getSettings,
} from "../../src/js/state/settings.js";
import { storage } from "../../src/js/utils/storage.js";

/** @param {Record<string, string>} items */
const stubStorage = (items) =>
  vi.stubGlobal("localStorage", {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = value;
    },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getSettings", () => {
  it("returns stored values", () => {
    stubStorage({ [SETTINGS_KEY]: JSON.stringify({ currency: "EUR" }) });
    expect(getSettings()).toEqual({ currency: "EUR" });
  });

  it("falls back to defaults for unknown values", () => {
    stubStorage({ [SETTINGS_KEY]: JSON.stringify({ currency: "BTC" }) });
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("falls back to defaults for corrupted JSON", () => {
    stubStorage({ [SETTINGS_KEY]: "{not json" });
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("falls back to defaults when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
    });
    expect(getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe("storage.set", () => {
  it("stores JSON and reports success", () => {
    const items = {};
    stubStorage(items);
    expect(storage.set("key", { a: 1 })).toBe(true);
    expect(items).toEqual({ key: '{"a":1}' });
  });

  it("reports failure instead of throwing", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    });
    expect(storage.set("key", 1)).toBe(false);
  });
});
