import { test, expect } from "./fixtures.js";
import { PAGES, THEMES, VISUAL_MASK, setTheme, waitForData } from "./pages.js";

for (const [name, path] of Object.entries(PAGES)) {
  for (const theme of THEMES) {
    test(`visual: ${name} (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto(path);
      await waitForData(page);
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
        fullPage: true,
        mask: VISUAL_MASK.map((selector) => page.locator(selector)),
      });
    });
  }
}
