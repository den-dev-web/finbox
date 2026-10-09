import { describe, expect, it } from "vitest";
import {
  categoryShares,
  formatMonth,
  reportCsv,
  savingsRate,
  summarize,
  toCsv,
} from "../../src/js/modules/reports/model.js";

const MONTHS = [
  { month: "2025-12", income: 6000, expense: 4500 },
  { month: "2026-01", income: 5000, expense: 5500 },
];

describe("summarize", () => {
  it("totals income and expenses with net and savings rate", () => {
    expect(summarize(MONTHS)).toEqual({
      income: 11000,
      expense: 10000,
      net: 1000,
      savingsRate: (1000 / 11000) * 100,
    });
  });

  it("has no savings rate without income", () => {
    expect(savingsRate(0, 100)).toBeNull();
    expect(savingsRate(5000, 5500)).toBe(-10);
  });
});

describe("categoryShares", () => {
  it("sorts by amount and adds the share of the total", () => {
    const shares = categoryShares([
      { category: "Food", amount: 250 },
      { category: "Bills", amount: 750 },
    ]);
    expect(shares).toEqual([
      { category: "Bills", amount: 750, share: 75 },
      { category: "Food", amount: 250, share: 25 },
    ]);
  });

  it("returns zero shares when nothing was spent", () => {
    expect(categoryShares([{ category: "Food", amount: 0 }])[0].share).toBe(0);
  });
});

describe("formatMonth", () => {
  it("names the month regardless of time zone", () => {
    expect(formatMonth("2025-05")).toBe("May 2025");
    expect(formatMonth("2026-01")).toBe("Jan 2026");
  });
});

describe("toCsv", () => {
  it("quotes fields with commas, quotes and line breaks", () => {
    expect(toCsv([["a,b", 'say "hi"', "two\nlines", 42]])).toBe(
      '"a,b","say ""hi""","two\nlines",42',
    );
  });

  it("separates rows with CRLF", () => {
    expect(toCsv([["a"], ["b"]])).toBe("a\r\nb");
  });
});

describe("reportCsv", () => {
  it("exports months in the display currency with plain numbers", () => {
    expect(reportCsv(MONTHS, "EUR").split("\r\n")).toEqual([
      "Month,Income (EUR),Expenses (EUR),Net (EUR),Savings rate (%)",
      "Dec 2025,5520.00,4140.00,1380.00,25.0",
      "Jan 2026,4600.00,5060.00,-460.00,-10.0",
    ]);
  });
});
