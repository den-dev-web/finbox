import { test, expect } from "./fixtures.js";
import { PAGES } from "./pages.js";

test("burger opens the sidebar and Escape closes it", async ({ page }) => {
  await page.goto(PAGES.dashboard);
  const burger = page.locator("[data-sidebar-toggle]");
  const sidebar = page.locator("#sidebar");
  await burger.click();
  await expect(burger).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar.getByRole("link", { name: "Reports" })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(burger).toHaveAttribute("aria-expanded", "false");
  await expect(
    sidebar.getByRole("link", { name: "Reports" }),
  ).not.toBeInViewport();
});

test("error state with ?fail=1 and retry", async ({ page }) => {
  await page.goto(`${PAGES.dashboard}?fail=1`);
  const card = page.locator('[data-metric="income"]');
  await expect(card).toHaveAttribute("data-state", "error");
  await expect(card.getByText("Failed to load data.")).toBeVisible();
  // ?fail=1 makes every request fail, so a retry ends in the error state again
  await card.getByRole("button", { name: "Retry" }).click();
  await expect(card).toHaveAttribute("data-state", "error");
});

test("transactions render as cards with filters", async ({ page }) => {
  await page.goto(PAGES.dashboard);
  const cards = page.locator("[data-table-cards] .c-table__card");
  await expect(cards).toHaveCount(4);
  await page.locator('[data-filter-trigger="category"]').click();
  await page
    .locator('[data-filter-option="category"][data-filter-value="Salary"]')
    .click();
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toContainText("$5,400.00");
});

test("dashboard works when storage is blocked", async ({ page }) => {
  // Some private modes and blocked-cookie settings throw on any storage access
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  await page.goto(PAGES.dashboard);
  await expect(page.locator('[data-metric="income"]')).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    /^(light|dark)$/,
  );
  await page.locator("[data-sidebar-toggle]").click();
  await page.getByRole("button", { name: /^Theme:/ }).click();
});
