import { describe, expect, it } from "vitest";
import {
  applyFilters,
  applySort,
  clampPage,
  collectFilterValues,
  getPageCount,
  isFiltering,
  nextSort,
  normalizeValue,
  paginate,
} from "../../src/js/modules/table/model.js";

const ROWS = [
  {
    date: "2026-04-12",
    category: "Travel",
    description: "Flight",
    amount: -680,
  },
  {
    date: "2026-04-09",
    category: "Salary",
    description: "Monthly",
    amount: 5400,
  },
  {
    date: "2026-04-07",
    category: "Bills",
    description: "Utilities",
    amount: -210,
  },
  {
    date: "2026-04-05",
    category: "Travel",
    description: "Hotel",
    amount: -320.5,
  },
];

const NO_FILTERS = {
  date: null,
  category: null,
  description: null,
  amount: null,
};
const amounts = (rows) => rows.map((row) => row.amount);

describe("applySort", () => {
  it("sorts by amount in both directions", () => {
    expect(amounts(applySort(ROWS, "amount", "asc"))).toEqual([
      -680, -320.5, -210, 5400,
    ]);
    expect(amounts(applySort(ROWS, "amount", "desc"))).toEqual([
      5400, -210, -320.5, -680,
    ]);
  });

  it("sorts by date", () => {
    expect(applySort(ROWS, "date", "asc").map((row) => row.date)).toEqual([
      "2026-04-05",
      "2026-04-07",
      "2026-04-09",
      "2026-04-12",
    ]);
  });

  it("does not mutate the input", () => {
    const copy = [...ROWS];
    applySort(ROWS, "amount", "asc");
    expect(ROWS).toEqual(copy);
  });
});

describe("nextSort", () => {
  it("flips the direction of the active column", () => {
    expect(
      nextSort({ sortKey: "date", sortDirection: "desc" }, "date"),
    ).toEqual({
      sortKey: "date",
      sortDirection: "asc",
    });
  });

  it("starts amounts descending and other columns ascending", () => {
    const current = { sortKey: "date", sortDirection: "asc" };
    expect(nextSort(current, "amount").sortDirection).toBe("desc");
    expect(
      nextSort({ sortKey: "amount", sortDirection: "asc" }, "date")
        .sortDirection,
    ).toBe("asc");
  });
});

describe("normalizeValue", () => {
  it("formats values the way the table displays them", () => {
    expect(normalizeValue("amount", ROWS[3])).toBe("-$320.50");
    expect(normalizeValue("amount", ROWS[1])).toBe("$5,400.00");
    expect(normalizeValue("category", ROWS[0])).toBe("Travel");
    expect(normalizeValue("missing", ROWS[0])).toBe("");
  });

  it("shows the calendar date from the data in any time zone", () => {
    expect(normalizeValue("date", ROWS[0])).toBe("12 Apr");
  });
});

describe("filters", () => {
  it("returns all rows without active filters", () => {
    expect(applyFilters(ROWS, NO_FILTERS)).toBe(ROWS);
    expect(isFiltering(NO_FILTERS)).toBe(false);
  });

  it("combines active filters with AND", () => {
    const filters = { ...NO_FILTERS, category: "Travel", amount: "-$680.00" };
    expect(isFiltering(filters)).toBe(true);
    expect(applyFilters(ROWS, filters)).toEqual([ROWS[0]]);
  });

  it("collects unique displayed values in first-seen order", () => {
    const values = collectFilterValues(ROWS);
    expect(values.category).toEqual(["Travel", "Salary", "Bills"]);
    expect(Object.keys(values)).toEqual([
      "date",
      "category",
      "description",
      "amount",
    ]);
  });
});

describe("pagination", () => {
  it("always has at least one page", () => {
    expect(getPageCount(0, 10)).toBe(1);
    expect(getPageCount(10, 4)).toBe(3);
  });

  it("clamps the page into range", () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(5, 3)).toBe(3);
  });

  it("returns the rows of the requested page", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ id: index }));
    const result = paginate(rows, 3, 4);
    expect(result).toMatchObject({ page: 3, pageCount: 3, start: 8 });
    expect(result.pageRows.map((row) => row.id)).toEqual([8, 9]);
  });

  it("moves to the last page when the requested one no longer exists", () => {
    expect(paginate(ROWS, 9, 2).page).toBe(2);
  });
});
