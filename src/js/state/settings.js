import { storage } from "../utils/storage.js";

/** @typedef {import("../types").Currency} Currency */
/** @typedef {import("../types").Period} Period */
/** @typedef {"system" | "light" | "dark"} ThemeSetting */
/** @typedef {"comfortable" | "compact"} Density */
/**
 * @typedef {{
 *   theme: ThemeSetting, currency: Currency,
 *   defaultPeriod: Period, density: Density
 * }} Settings
 */

// Also read by the inline script in src/partials/head-common.html
export const SETTINGS_KEY = "finbox-settings";

/** Allowed values per setting, in the order the Settings form shows them */
export const SETTING_OPTIONS = {
  theme: /** @type {ThemeSetting[]} */ (["system", "light", "dark"]),
  currency: /** @type {Currency[]} */ (["USD", "EUR", "UAH"]),
  defaultPeriod: /** @type {Period[]} */ (["day", "week", "month", "year"]),
  density: /** @type {Density[]} */ (["comfortable", "compact"]),
};

/** @type {Settings} */
export const DEFAULT_SETTINGS = {
  theme: "system",
  currency: "USD",
  defaultPeriod: "month",
  density: "comfortable",
};

/**
 * Stored settings merged over the defaults; unknown or invalid values
 * (old versions, manual edits) fall back to the default.
 * @returns {Settings}
 */
export const getSettings = () => {
  const stored = storage.get(SETTINGS_KEY);
  const values = /** @type {Record<string, unknown>} */ (
    stored && typeof stored === "object" ? stored : {}
  );
  /** @type {Record<string, unknown>} */
  const result = {};
  for (const [key, allowed] of Object.entries(SETTING_OPTIONS)) {
    const value = values[key];
    result[key] = /** @type {unknown[]} */ (allowed).includes(value)
      ? value
      : DEFAULT_SETTINGS[/** @type {keyof Settings} */ (key)];
  }
  return /** @type {Settings} */ (result);
};

/**
 * @param {Partial<Settings>} changes
 * @returns {boolean} false when the browser blocks storage
 */
export const saveSettings = (changes) =>
  storage.set(SETTINGS_KEY, { ...getSettings(), ...changes });
