// Key pages of the project: used by html, a11y and visual tests (paths are relative to baseURL).
export const PAGES = {
  dashboard: "./",
  reports: "./reports/",
  accounts: "./accounts/",
};

export const THEMES = ["light", "dark"];

// Theme is stored before the page loads, so the inline head script applies it on first paint
export async function setTheme(page, theme) {
  await page.addInitScript((value) => {
    localStorage.setItem("finbox-theme", value);
  }, theme);
}

// Scrolls through the page like a visitor (lazy charts render when visible),
// then waits until every widget has left the loading state
export async function waitForData(page) {
  await page.evaluate(async () => {
    const nextFrame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += window.innerHeight
    ) {
      window.scrollTo(0, y);
      await nextFrame();
    }
    window.scrollTo(0, 0);
    await nextFrame();
  });
  await page.waitForFunction(
    () => !document.querySelector('[data-state="loading"]'),
  );
}

// Volatile content hidden in screenshots: none yet (mock data is static)
export const VISUAL_MASK = [];
