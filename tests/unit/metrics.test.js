import { describe, expect, it } from "vitest";
import { formatDelta } from "../../src/js/modules/metrics.js";

describe("formatDelta", () => {
  it("shows direction with an arrow", () => {
    expect(formatDelta(8.4)).toBe("▲ 8.4%");
    expect(formatDelta(-3.2)).toBe("▼ 3.2%");
  });

  it("drops the decimal for whole numbers and rounds to one digit", () => {
    expect(formatDelta(5)).toBe("▲ 5%");
    expect(formatDelta(1.26)).toBe("▲ 1.3%");
  });

  it("treats zero as growth", () => {
    expect(formatDelta(0)).toBe("▲ 0%");
  });

  it("shows a dash when there is no value", () => {
    expect(formatDelta(undefined)).toBe("—");
  });
});
