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

test("default period from settings loads first", async ({ page }) => {
  await storeSettings(page, { defaultPeriod: "week" });
  await page.goto(PAGES.dashboard);
  await waitForData(page);
  await expect(page.locator("[data-dropdown-trigger]")).toHaveText(
    "Period: Week",
  );
  // The panel is closed, so its options are not in the accessibility tree
  await expect(
    page.locator('[data-dropdown-panel] [data-value="week"]'),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.locator('[data-metric="income"] [data-metric-value]'),
  ).toHaveText("$62,400");
});

test("compact density tightens table rows before first paint", async ({
  page,
}) => {
  const rowHeight = async () => {
    await page.goto(PAGES.dashboard);
    await waitForData(page);
    return page
      .locator("[data-table-body] tr")
      .first()
      .evaluate((row) => row.getBoundingClientRect().height);
  };
  const comfortable = await rowHeight();
  await storeSettings(page, { density: "compact" });
  const compact = await rowHeight();
  await expect(page.locator("html")).toHaveAttribute("data-density", "compact");
  expect(compact).toBeLessThan(comfortable);
});

test("system theme follows the OS scheme live", async ({ page }) => {
  await storeSettings(page, { theme: "system" });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(PAGES.dashboard);
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).toHaveAttribute("data-theme", "light");
});

test.describe("settings page", () => {
  test("shows stored values", async ({ page }) => {
    await storeSettings(page, { theme: "dark", currency: "UAH" });
    await page.goto(PAGES.settings);
    await expect(page.getByLabel("Dark")).toBeChecked();
    await expect(page.getByLabel("Currency")).toHaveValue("UAH");
    await expect(page.getByLabel("Default period")).toHaveValue("month");
    await expect(page.getByText("1 USD = 0.92 EUR = 41.5 UAH")).toBeVisible();
  });

  test("saves on change and other pages use it", async ({ page }) => {
    await page.goto(PAGES.settings);
    await page.getByLabel("Currency").selectOption("EUR");
    await expect(page.locator("[data-settings-status]")).toHaveText(
      "Saved. Other pages use the new settings when you open them.",
    );
    await page.getByRole("link", { name: "Dashboard" }).click();
    await waitForData(page);
    await expect(
      page.locator('[data-metric="income"] [data-metric-value]'),
    ).toHaveText("€222,456");
  });

  test("theme applies at once and persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(PAGES.settings);
    const html = page.locator("html");
    await page.getByLabel("Dark").check();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(page.getByLabel("Dark")).toBeChecked();
  });

  test("reset restores the defaults", async ({ page }) => {
    await storeSettings(page, { currency: "EUR", density: "compact" });
    await page.goto(PAGES.settings);
    await page.getByRole("button", { name: "Reset to defaults" }).click();
    await expect(page.getByLabel("Currency")).toHaveValue("USD");
    await expect(page.getByLabel("Comfortable")).toBeChecked();
    await expect(page.locator("[data-settings-status]")).toHaveText(
      "Defaults restored.",
    );
  });

  test("explains when storage is blocked", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
    await page.goto(PAGES.settings);
    await page.getByLabel("Compact").check();
    await expect(page.locator("[data-settings-status]")).toHaveText(
      "Your browser blocks storage, so settings apply to this page only.",
    );
  });
});
