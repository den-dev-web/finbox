import { describe, expect, it } from "vitest";
import { RATES, formatMoney } from "../../src/js/utils/format.js";

describe("formatMoney", () => {
  it("formats USD without cents by default", () => {
    expect(formatMoney(241800)).toBe("$241,800");
    expect(formatMoney(-1234.5)).toBe("-$1,235");
  });

  it("shows cents in statement style", () => {
    expect(formatMoney(-320.5, { cents: true })).toBe("-$320.50");
    expect(formatMoney(5400, { cents: true })).toBe("$5,400.00");
  });

  it("converts USD amounts with the fixed rates", () => {
    expect(formatMoney(1000, { currency: "EUR" })).toBe("€920");
    expect(formatMoney(1000, { currency: "UAH" })).toBe("₴41,500");
    expect(formatMoney(-10, { currency: "EUR", cents: true })).toBe("-€9.20");
  });

  it("has a rate for every currency", () => {
    expect(Object.keys(RATES)).toEqual(["USD", "EUR", "UAH"]);
  });
});
