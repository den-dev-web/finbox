import { test, expect } from "./fixtures.js";
import { PAGES, waitForData } from "./pages.js";

// Global checkpoints (frontend.md) plus a common laptop width
const WIDTHS = [320, 576, 768, 992, 1024, 1100, 1200, 1400];
const HEIGHT = 900;

for (const [name, path] of Object.entries(PAGES)) {
  test(`no horizontal scroll: ${name}`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: HEIGHT });
      await page.goto(path);
      await waitForData(page);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect.soft(overflow, `${name} ${width}px wide`).toBe(0);
    }
  });
}
