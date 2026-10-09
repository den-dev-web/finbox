import { defineConfig, devices } from "@playwright/test";

const PORT = 4318;
// GitHub Pages serves the site from /finbox/ (vite.config.js base)
const BASE_URL = `http://127.0.0.1:${PORT}/finbox/`;
// Passport breakpoints: min / intermediate / max design widths
const BREAKPOINTS = [375, 768, 1440];
const VIEWPORT_HEIGHT = 900;
// Widths below this are emulated as touch devices: viewport meta applied, touch, mobile UA, high DPR
const TOUCH_MAX_WIDTH = 1024;
const BROWSERS = {
  chromium: { desktop: devices["Desktop Chrome"], touch: devices["Pixel 7"] },
  webkit: { desktop: devices["Desktop Safari"], touch: devices["iPhone 13"] },
  // Firefox has no mobile emulation (isMobile unsupported): narrow desktop window only
  firefox: {
    desktop: devices["Desktop Firefox"],
    touch: devices["Desktop Firefox"],
  },
};

export default defineConfig({
  testDir: "tests/e2e",
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  // Rendering inside the Playwright image is deterministic, so any pixel color change is a diff.
  // The default per-pixel threshold (0.2) let a text color drop below WCAG contrast pass unnoticed.
  expect: { toHaveScreenshot: { threshold: 0 } },
  // Tests run against the production build, the same files that are deployed
  webServer: {
    command: `npx vite build --logLevel error && npx vite preview --port ${PORT} --strictPort --host 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "smoke",
      testMatch: ["smoke.spec.js", "settings.spec.js"],
      use: devices["Desktop Chrome"],
    },
    {
      name: "smoke-mobile",
      testMatch: "smoke-mobile.spec.js",
      use: { ...devices["Pixel 7"], viewport: { width: 375, height: 800 } },
    },
    { name: "html", testMatch: "html.spec.js", use: devices["Desktop Chrome"] },
    // Desktop and mobile layouts expose different controls (sidebar, header buttons)
    {
      name: "a11y-desktop",
      testMatch: "a11y.spec.js",
      use: devices["Desktop Chrome"],
    },
    {
      name: "a11y-mobile",
      testMatch: "a11y.spec.js",
      use: { ...devices["Pixel 7"], viewport: { width: 375, height: 800 } },
    },
    ...Object.entries(BROWSERS).flatMap(([browser, { desktop, touch }]) =>
      BREAKPOINTS.map((width) => ({
        name: `visual-${browser}-${width}`,
        testMatch: "visual.spec.js",
        use: {
          ...(width < TOUCH_MAX_WIDTH ? touch : desktop),
          viewport: { width, height: VIEWPORT_HEIGHT },
          // Instant scroll and no reveal transitions: screenshots must not catch motion mid-way
          reducedMotion: "reduce",
        },
      })),
    ),
  ],
});
