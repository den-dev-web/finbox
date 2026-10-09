// Pure table logic: no DOM access, so it can be unit-tested in isolation.

export const FILTER_FIELDS = ["date", "category", "description", "amount"];

export const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const sorters = {
  date: (a, b) => new Date(a.date) - new Date(b.date),
  amount: (a, b) => a.amount - b.amount,
};

export const applySort = (rows, key, direction) => {
  const sorted = [...rows].sort(sorters[key]);
  return direction === "asc" ? sorted : sorted.reverse();
};

// Clicking the active column flips the direction; a new column starts
// descending for amounts (largest first) and ascending otherwise
export const nextSort = ({ sortKey, sortDirection }, key) => {
  if (sortKey === key) {
    return { sortKey, sortDirection: sortDirection === "asc" ? "desc" : "asc" };
  }
  return { sortKey: key, sortDirection: key === "amount" ? "desc" : "asc" };
};

// Filters compare the displayed text, so options match what the user sees
export const normalizeValue = (field, row) => {
  if (field === "date") {
    return formatDate.format(new Date(row.date));
  }
  if (field === "amount") {
    return formatCurrency.format(row.amount);
  }
  return row[field] ?? "";
};

export const isFiltering = (filters) =>
  Object.values(filters).some((value) => value);

export const applyFilters = (rows, filters) => {
  const activeFields = Object.entries(filters).filter(([, value]) => value);
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
export const collectFilterValues = (rows) =>
  Object.fromEntries(
    FILTER_FIELDS.map((field) => [
      field,
      [...new Set(rows.map((row) => normalizeValue(field, row)))],
    ]),
  );

export const getPageCount = (total, pageSize) =>
  Math.max(1, Math.ceil(total / pageSize));

export const clampPage = (page, pageCount) =>
  Math.min(Math.max(page, 1), pageCount);

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
