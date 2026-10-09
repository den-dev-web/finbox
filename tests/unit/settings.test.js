import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  getSettings,
  saveSettings,
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
  it("returns stored values over the defaults", () => {
    stubStorage({
      [SETTINGS_KEY]: JSON.stringify({ currency: "EUR", density: "compact" }),
    });
    expect(getSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      currency: "EUR",
      density: "compact",
    });
  });

  it("falls back per field for unknown values", () => {
    stubStorage({
      [SETTINGS_KEY]: JSON.stringify({
        theme: "sepia",
        currency: "BTC",
        defaultPeriod: "week",
        extra: true,
      }),
    });
    expect(getSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      defaultPeriod: "week",
    });
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

describe("saveSettings", () => {
  it("merges changes into the current settings", () => {
    const items = { [SETTINGS_KEY]: JSON.stringify({ currency: "UAH" }) };
    stubStorage(items);
    expect(saveSettings({ theme: "dark" })).toBe(true);
    expect(JSON.parse(items[SETTINGS_KEY])).toEqual({
      ...DEFAULT_SETTINGS,
      currency: "UAH",
      theme: "dark",
    });
  });
});
