// Pure account logic: validation, conversion, search. No DOM access.
import { RATES } from "../../utils/format.js";

/** @typedef {import("../../types").Account} Account */
/** @typedef {import("../../types").AccountType} AccountType */
/** @typedef {import("../../types").Currency} Currency */
/** @typedef {{ name: string, type: string, institution: string, balance: string }} AccountForm */
/** @typedef {Partial<Record<keyof AccountForm, string>>} AccountErrors */

/** @type {Record<AccountType, string>} */
export const ACCOUNT_TYPES = {
  bank: "Bank account",
  savings: "Savings",
  card: "Credit card",
  investment: "Investment",
  cash: "Cash",
};

export const NAME_MAX_LENGTH = 40;
export const INSTITUTION_MAX_LENGTH = 40;
export const BALANCE_LIMIT = 10_000_000;
// Optional minus, digits, up to two decimals ("1250", "-42.5", "0.99")
const AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;

/**
 * Removes spaces and thousands separators people type: "1,250.50" -> "1250.50"
 * @param {string} value
 */
const normalizeAmount = (value) => value.replace(/[\s,]/g, "");

/**
 * @param {string} value
 * @returns {value is AccountType}
 */
const isAccountType = (value) => Object.keys(ACCOUNT_TYPES).includes(value);

/**
 * Returns a message per invalid field; an empty object means the form is valid.
 * @param {AccountForm} form
 * @returns {AccountErrors}
 */
export const validateAccount = (form) => {
  /** @type {AccountErrors} */
  const errors = {};
  const name = form.name.trim();
  const amount = normalizeAmount(form.balance);

  if (!name) {
    errors.name = "Enter an account name.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Use ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (!isAccountType(form.type)) {
    errors.type = "Choose an account type.";
  }

  if (form.institution.trim().length > INSTITUTION_MAX_LENGTH) {
    errors.institution = `Use ${INSTITUTION_MAX_LENGTH} characters or fewer.`;
  }

  if (!amount) {
    errors.balance = "Enter the current balance.";
  } else if (!AMOUNT_PATTERN.test(amount)) {
    errors.balance = "Enter a number with up to 2 decimals, e.g. 1250.50.";
  } else if (Math.abs(Number(amount)) > BALANCE_LIMIT) {
    errors.balance = "Enter an amount up to 10,000,000.";
  }

  return errors;
};

/**
 * Builds an account from a valid form; the balance is entered in the display
 * currency and stored in USD like the rest of the data.
 * @param {AccountForm} form
 * @param {{ id: string, currency: Currency }} options
 * @returns {Account}
 */
export const createAccount = (form, { id, currency }) => ({
  id,
  name: form.name.trim(),
  type: /** @type {AccountType} */ (form.type),
  institution: form.institution.trim(),
  balance:
    Math.round(
      (Number(normalizeAmount(form.balance)) / RATES[currency]) * 100,
    ) / 100,
});

/**
 * Case-insensitive match on name, institution or type label.
 * @param {Account[]} accounts
 * @param {string} query
 */
export const filterAccounts = (accounts, query) => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return accounts;
  }
  return accounts.filter((account) =>
    [account.name, account.institution, ACCOUNT_TYPES[account.type]].some(
      (text) => text.toLowerCase().includes(needle),
    ),
  );
};

/** @param {Account[]} accounts */
export const totalBalance = (accounts) =>
  accounts.reduce((sum, account) => sum + account.balance, 0);

/**
 * Keeps only well-formed accounts from storage (old versions, manual edits).
 * @param {unknown} value
 * @returns {Account[]}
 */
export const parseStoredAccounts = (value) =>
  Array.isArray(value)
    ? value.filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          isAccountType(item.type) &&
          typeof item.institution === "string" &&
          Number.isFinite(item.balance),
      )
    : [];
