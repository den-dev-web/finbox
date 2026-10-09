import { storage } from "../utils/storage.js";

/** @typedef {import("../types").Currency} Currency */
/** @typedef {{ currency: Currency }} Settings */

export const SETTINGS_KEY = "finbox-settings";

/** @type {Currency[]} */
export const CURRENCIES = ["USD", "EUR", "UAH"];

/** @type {Settings} */
export const DEFAULT_SETTINGS = { currency: "USD" };

/**
 * Stored settings merged over the defaults; unknown or invalid values
 * (old versions, manual edits) fall back to the default.
 * @returns {Settings}
 */
export const getSettings = () => {
  const stored = storage.get(SETTINGS_KEY);
  const values = stored && typeof stored === "object" ? stored : {};
  const currency = /** @type {{ currency?: unknown }} */ (values).currency;
  return {
    currency: CURRENCIES.includes(/** @type {Currency} */ (currency))
      ? /** @type {Currency} */ (currency)
      : DEFAULT_SETTINGS.currency,
  };
};
