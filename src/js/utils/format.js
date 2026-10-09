import { getSettings } from "../state/settings.js";

/** @typedef {import("../types").Currency} Currency */

// Fixed mock exchange rates: amounts in the data are stored in USD
export const RATES = { USD: 1, EUR: 0.92, UAH: 41.5 };

// Settings change on another page, which reloads this module
const currentCurrency = getSettings().currency;

/** @type {Map<string, Intl.NumberFormat>} */
const formatters = new Map();

/**
 * @param {Currency} currency
 * @param {boolean} cents
 */
const getFormatter = (currency, cents) => {
  const key = `${currency}:${cents}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    const digits = cents ? 2 : 0;
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(key, formatter);
  }
  return formatter;
};

/**
 * Converts a USD amount to the display currency and formats it.
 * @param {number} amountUsd
 * @param {{ cents?: boolean, currency?: Currency }} [options]
 *   cents: statement style with two decimals; currency defaults to the setting
 */
export const formatMoney = (
  amountUsd,
  { cents = false, currency = currentCurrency } = {},
) => getFormatter(currency, cents).format(amountUsd * RATES[currency]);

export const displayCurrency = () => currentCurrency;
