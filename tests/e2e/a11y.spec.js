import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures.js";
import { PAGES, THEMES, setTheme, waitForData } from "./pages.js";

// WCAG 2.2 level A and AA rules
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const [name, path] of Object.entries(PAGES)) {
  for (const theme of THEMES) {
    test(`a11y: ${name} (${theme})`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto(path);
      await waitForData(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();
      const summary = violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
