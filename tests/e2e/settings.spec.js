import { test, expect } from "./fixtures.js";
import { PAGES, waitForData } from "./pages.js";

/**
 * @param {import("@playwright/test").Page} page
 * @param {Record<string, unknown>} settings
 */
const storeSettings = (page, settings) =>
  page.addInitScript((value) => {
    localStorage.setItem("finbox-settings", JSON.stringify(value));
  }, settings);

test("stored currency converts every amount on the dashboard", async ({
  page,
}) => {
  await storeSettings(page, { currency: "EUR" });
  await page.goto(PAGES.dashboard);
  await waitForData(page);
  // $241,800 × 0.92
  await expect(
    page.locator('[data-metric="income"] [data-metric-value]'),
  ).toHaveText("€222,456");
  await expect(page.locator(".c-chart__unit").first()).toHaveText("EUR");
  // Flight tickets -$680 × 0.92, statement style
  await expect(page.locator("[data-table-body]")).toContainText("-€625.60");
});
