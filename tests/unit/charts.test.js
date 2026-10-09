import { describe, expect, it } from "vitest";
import { computeLineStats } from "../../src/js/modules/charts.js";

describe("computeLineStats", () => {
  it("returns average, extremes and change from first to last value", () => {
    expect(computeLineStats([100, 300, 50, 150])).toEqual({
      avg: 150,
      min: 50,
      max: 300,
      change: 50,
    });
  });

  it("measures change against the absolute first value", () => {
    expect(computeLineStats([-200, -100]).change).toBe(50);
  });

  it("has no change when the series starts at zero", () => {
    expect(computeLineStats([0, 10]).change).toBeNull();
  });

  it("returns null for empty or invalid input", () => {
    expect(computeLineStats([])).toBeNull();
    expect(computeLineStats(undefined)).toBeNull();
  });
});
