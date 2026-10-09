import { test, expect } from "./fixtures.js";
import { PAGES, waitForData } from "./pages.js";

const incomeValue = (page) =>
  page.locator('[data-metric="income"] [data-metric-value]');
const amounts = (page) =>
  page.locator("[data-table-body] .c-table__amount").allTextContents();

test.beforeEach(async ({ page }) => {
  const response = await page.goto(PAGES.dashboard);
  expect(response?.status()).toBe(200);
  await waitForData(page);
});

test("dashboard loads with one h1 and data", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(incomeValue(page)).toHaveText("$241,800");
  await expect(page.locator("[data-table-body] tr")).toHaveCount(4);
});

test("period dropdown reloads data", async ({ page }) => {
  const trigger = page.locator("[data-dropdown-trigger]");
  await trigger.click();
  await page.getByRole("option", { name: "Week" }).click();
  await expect(trigger).toHaveText("Period: Week");
  await expect(incomeValue(page)).toHaveText("$62,400");
});

test("theme toggle switches and persists after reload", async ({ page }) => {
  const html = page.locator("html");
  const initial = await html.getAttribute("data-theme");
  const toggled = initial === "dark" ? "light" : "dark";
  await page.locator(".c-header__button--theme").click();
  await expect(html).toHaveAttribute("data-theme", toggled);
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", toggled);
});

test("table sorts by amount", async ({ page }) => {
  const sortButton = page.locator('[data-sort-key="amount"]');
  const header = page.locator("th", { has: sortButton });
  await sortButton.click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  expect(await amounts(page)).toEqual(["$5,400", "-$210", "-$320", "-$680"]);
  await sortButton.click();
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  expect(await amounts(page)).toEqual(["-$680", "-$320", "-$210", "$5,400"]);
});

test("table filters by category and resets", async ({ page }) => {
  const rows = page.locator("[data-table-body] tr");
  const chip = page.locator('[data-filter-trigger="category"]');
  await chip.click();
  await page
    .locator('[data-filter-option="category"][data-filter-value="Travel"]')
    .click();
  await expect(chip).toHaveText("Category: Travel");
  await expect(rows).toHaveCount(1);
  await page.locator("[data-table-filter-reset]").click();
  await expect(rows).toHaveCount(4);
});

test("row action menu opens and closes with Escape", async ({ page }) => {
  const toggle = page.locator("[data-table-body] [data-action-toggle]").first();
  const menu = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("menuitem", { name: "Edit" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeHidden();
});
