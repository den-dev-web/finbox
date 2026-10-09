import { defineConfig } from "vite";

// GitHub Pages serves the project from /finbox/
export default defineConfig({
  base: "/finbox/",
  test: {
    // Playwright specs (tests/e2e/*.spec.js) are not Vitest tests
    include: ["tests/unit/**/*.test.js"],
    // A UTC-negative zone makes date-only strings shift a day if parsed as local time
    env: { TZ: "America/New_York" },
  },
});
