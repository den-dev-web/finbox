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
