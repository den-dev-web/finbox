import { readFile } from "node:fs/promises";
import { test, expect } from "./fixtures.js";
import { PAGES, waitForData } from "./pages.js";

test.beforeEach(async ({ page }) => {
  await page.goto(PAGES.reports);
  await waitForData(page);
});

test("reports page shows yearly totals and all months", async ({ page }) => {
  await expect(page.locator("h1")).toHaveText("Reports");
  await expect(page.locator('[data-report-total="income"]')).toHaveText(
    "$77,080",
  );
  await expect(page.locator('[data-report-total="savings"]')).toHaveText(
    "17.3%",
  );
  await expect(page.locator("[data-report-rows] tr")).toHaveCount(12);
  await expect(page.locator(".c-bar-chart__bar")).toHaveCount(24);
});

test("sidebar marks the current page and links back", async ({ page }) => {
  const current = page.locator('.c-sidebar__link[aria-current="page"]');
  await expect(current).toHaveText("Reports");
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.locator("h1")).toHaveText("Dashboard");
});

test("exports the monthly report as CSV", async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(
    "finbox-report-2025-05_2026-04-USD.csv",
  );
  const lines = (await readFile(await download.path(), "utf8")).split("\r\n");
  expect(lines).toHaveLength(13);
  expect(lines[0]).toBe(
    "Month,Income (USD),Expenses (USD),Net (USD),Savings rate (%)",
  );
  expect(lines[1]).toBe("May 2025,5478.34,6088.09,-609.75,-11.1");
});
