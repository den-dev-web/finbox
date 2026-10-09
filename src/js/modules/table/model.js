// Pure table logic: no DOM access, so it can be unit-tested in isolation.
import { formatMoney } from "../../utils/format.js";

/** @typedef {import("../../types").Transaction} Transaction */
/** @typedef {"date" | "category" | "description" | "amount"} FilterField */
/** @typedef {"date" | "amount"} SortKey */
/** @typedef {"asc" | "desc"} SortDirection */
/** @typedef {{ sortKey: SortKey, sortDirection: SortDirection }} SortState */
/** @typedef {Record<FilterField, string | null>} Filters */

/** @type {FilterField[]} */
export const FILTER_FIELDS = ["date", "category", "description", "amount"];

// Date-only strings ("2026-04-12") parse as UTC midnight; formatting in UTC
// keeps the calendar date instead of shifting it in negative-offset zones
export const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

/** @type {Record<SortKey, (a: Transaction, b: Transaction) => number>} */
const sorters = {
  date: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  amount: (a, b) => a.amount - b.amount,
};

/**
 * @param {Transaction[]} rows
 * @param {SortKey} key
 * @param {SortDirection} direction
 * @returns {Transaction[]} a sorted copy
 */
export const applySort = (rows, key, direction) => {
  const sorted = [...rows].sort(sorters[key]);
  return direction === "asc" ? sorted : sorted.reverse();
};

// Clicking the active column flips the direction; a new column starts
// descending for amounts (largest first) and ascending otherwise
/**
 * @param {SortState} current
 * @param {SortKey} key
 * @returns {SortState}
 */
export const nextSort = ({ sortKey, sortDirection }, key) => {
  if (sortKey === key) {
    return { sortKey, sortDirection: sortDirection === "asc" ? "desc" : "asc" };
  }
  return { sortKey: key, sortDirection: key === "amount" ? "desc" : "asc" };
};

// Filters compare the displayed text, so options match what the user sees
/**
 * @param {FilterField} field
 * @param {Transaction} row
 * @returns {string}
 */
export const normalizeValue = (field, row) => {
  if (field === "date") {
    return formatDate.format(new Date(row.date));
  }
  if (field === "amount") {
    // Statement style: always show cents so the amount column lines up
    return formatMoney(row.amount, { cents: true });
  }
  return row[field] ?? "";
};

/** @param {Filters} filters */
export const isFiltering = (filters) =>
  Object.values(filters).some((value) => value);

/**
 * Keeps rows that match every active filter (AND).
 * @param {Transaction[]} rows
 * @param {Filters} filters
 * @returns {Transaction[]}
 */
export const applyFilters = (rows, filters) => {
  const entries = /** @type {[FilterField, string | null][]} */ (
    Object.entries(filters)
  );
  const activeFields = entries.filter(([, value]) => value);
  if (activeFields.length === 0) {
    return rows;
  }
  return rows.filter((row) =>
    activeFields.every(
      ([field, value]) => normalizeValue(field, row) === value,
    ),
  );
};

// Unique displayed values per field, in first-seen order
/**
 * @param {Transaction[]} rows
 * @returns {Record<FilterField, string[]>}
 */
export const collectFilterValues = (rows) =>
  /** @type {Record<FilterField, string[]>} */ (
    Object.fromEntries(
      FILTER_FIELDS.map((field) => [
        field,
        [...new Set(rows.map((row) => normalizeValue(field, row)))],
      ]),
    )
  );

/**
 * @param {number} total
 * @param {number} pageSize
 */
export const getPageCount = (total, pageSize) =>
  Math.max(1, Math.ceil(total / pageSize));

/**
 * @param {number} page
 * @param {number} pageCount
 */
export const clampPage = (page, pageCount) =>
  Math.min(Math.max(page, 1), pageCount);

/**
 * @template T
 * @param {T[]} rows
 * @param {number} page requested page, clamped into range
 * @param {number} pageSize
 */
export const paginate = (rows, page, pageSize) => {
  const pageCount = getPageCount(rows.length, pageSize);
  const currentPage = clampPage(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    pageCount,
    start,
    pageRows: rows.slice(start, start + pageSize),
  };
};
