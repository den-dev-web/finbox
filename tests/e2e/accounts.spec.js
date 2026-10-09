import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.js";
import { PAGES, waitForData } from "./pages.js";

/** @param {import("@playwright/test").Page} page */
const accountCards = (page) => page.locator("[data-account-list] .c-account");
/** @param {import("@playwright/test").Page} page */
const openDialog = (page) =>
  page.getByRole("button", { name: "Add account" }).click();

test.beforeEach(async ({ page }) => {
  await page.goto(PAGES.accounts);
  await waitForData(page);
});

test("lists demo accounts with the total balance", async ({ page }) => {
  await expect(accountCards(page)).toHaveCount(6);
  await expect(page.locator("[data-account-total]")).toHaveText("$50,394.67");
  await expect(page.locator("[data-account-count]")).toHaveText("6 accounts");
});

test("search filters by bank and shows an empty state", async ({ page }) => {
  const search = page.getByLabel("Search accounts");
  await search.fill("revolut");
  await expect(accountCards(page)).toHaveCount(1);
  await expect(page.locator("[data-account-count]")).toHaveText(
    "1 of 6 accounts",
  );
  await search.fill("no such bank");
  await expect(page.getByText("No accounts match your search.")).toBeVisible();
});

test("validates the form, adds an account and keeps it", async ({ page }) => {
  await openDialog(page);
  const dialog = page.getByRole("dialog", { name: "Add account" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Add account" }).click();
  const name = dialog.getByLabel("Name");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(dialog.getByText("Enter an account name.")).toBeVisible();
  await expect(dialog.getByText("Choose an account type.")).toBeVisible();

  await name.fill("Credit line");
  await expect(dialog.getByText("Enter an account name.")).toBeHidden();
  await dialog.getByLabel("Type").selectOption("card");
  const balance = dialog.getByLabel("Balance (USD)");
  await balance.fill("12.345");
  await dialog.getByRole("button", { name: "Add account" }).click();
  await expect(balance).toBeFocused();
  await expect(
    dialog.getByText("Enter a number with up to 2 decimals, e.g. 1250.50."),
  ).toBeVisible();

  await balance.fill("-250.50");
  await dialog.getByRole("button", { name: "Add account" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Add account" })).toBeFocused();
  await expect(accountCards(page)).toHaveCount(7);
  await expect(accountCards(page).last()).toContainText("-$250.50");

  await page.reload();
  await waitForData(page);
  await expect(accountCards(page)).toHaveCount(7);
});

test("open dialog has no accessibility violations", async ({ page }) => {
  await openDialog(page);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add account" })
    .click();
  const { violations } = await new AxeBuilder({ page })
    .include("[data-account-dialog]")
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("converts a balance entered in euros", async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "finbox-settings",
      JSON.stringify({ currency: "EUR" }),
    ),
  );
  await page.reload();
  await waitForData(page);
  await openDialog(page);
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("Euro savings");
  await dialog.getByLabel("Type").selectOption("savings");
  await dialog.getByLabel("Balance (EUR)").fill("920");
  await dialog.getByRole("button", { name: "Add account" }).click();
  await expect(accountCards(page).last()).toContainText("€920.00");
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("finbox-accounts") ?? "[]"),
  );
  // Stored in USD like the rest of the data: 920 / 0.92
  expect(stored[0].balance).toBe(1000);
});
