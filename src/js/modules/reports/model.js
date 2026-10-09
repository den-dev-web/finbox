// Pure report calculations and CSV export: no DOM access.
import { RATES } from "../../utils/format.js";

/** @typedef {import("../../types").MonthTotal} MonthTotal */
/** @typedef {import("../../types").CategoryTotal} CategoryTotal */
/** @typedef {import("../../types").Currency} Currency */

const PERCENT = 100;

/**
 * Share of income left after expenses; null when there was no income.
 * @param {number} income
 * @param {number} expense
 */
export const savingsRate = (income, expense) =>
  income === 0 ? null : ((income - expense) / income) * PERCENT;

/**
 * @param {MonthTotal[]} months
 * @returns {{ income: number, expense: number, net: number, savingsRate: number | null }}
 */
export const summarize = (months) => {
  const income = months.reduce((sum, month) => sum + month.income, 0);
  const expense = months.reduce((sum, month) => sum + month.expense, 0);
  return {
    income,
    expense,
    net: income - expense,
    savingsRate: savingsRate(income, expense),
  };
};

/**
 * Categories from largest to smallest with their share of the total.
 * @param {CategoryTotal[]} categories
 * @returns {(CategoryTotal & { share: number })[]}
 */
export const categoryShares = (categories) => {
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  return [...categories]
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      share: total === 0 ? 0 : (item.amount / total) * PERCENT,
    }));
};

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * "2025-05" -> "May 2025"
 * @param {string} month
 */
export const formatMonth = (month) =>
  monthFormat.format(new Date(`${month}-01T00:00:00Z`));

// RFC 4180: quote fields with commas, quotes or line breaks; double inner quotes
/** @param {string | number} value */
const escapeCsv = (value) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/**
 * @param {(string | number)[][]} rows
 * @returns {string} CSV with CRLF line endings
 */
export const toCsv = (rows) =>
  rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");

/**
 * Monthly report in the display currency; numbers stay plain for spreadsheets.
 * @param {MonthTotal[]} months
 * @param {Currency} currency
 */
export const reportCsv = (months, currency) => {
  /** @param {number} amountUsd */
  const money = (amountUsd) => (amountUsd * RATES[currency]).toFixed(2);
  return toCsv([
    [
      "Month",
      `Income (${currency})`,
      `Expenses (${currency})`,
      `Net (${currency})`,
      "Savings rate (%)",
    ],
    ...months.map(({ month, income, expense }) => [
      formatMonth(month),
      money(income),
      money(expense),
      money(income - expense),
      savingsRate(income, expense)?.toFixed(1) ?? "",
    ]),
  ]);
};
