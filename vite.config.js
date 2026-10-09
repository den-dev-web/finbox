import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = (path) => fileURLToPath(new URL(path, import.meta.url));

// Pages by nav name; nested index.html files give clean URLs (/finbox/reports/)
const PAGES = {
  dashboard: "index.html",
};

const INCLUDE_PATTERN = /<!-- @include ([\w-]+) -->/g;
const NAV_PATTERN = / data-nav="([\w-]+)"/g;

// "/index.html" -> "dashboard", "/reports/index.html" -> "reports"
const pageName = (path) =>
  path === "/index.html" ? "dashboard" : path.split("/")[1];

/**
 * Inlines shared markup from src/partials/<name>.html in place of
 * `<!-- @include name -->`, then turns the current page's `data-nav`
 * link into `aria-current="page"` and drops the attribute elsewhere.
 */
const htmlPartials = () => ({
  name: "finbox-html-partials",
  transformIndexHtml: {
    order: "pre",
    handler(html, { path }) {
      const page = pageName(path);
      return html
        .replace(INCLUDE_PATTERN, (_, name) =>
          readFileSync(root(`./src/partials/${name}.html`), "utf8"),
        )
        .replace(NAV_PATTERN, (_, nav) =>
          nav === page ? ' aria-current="page"' : "",
        );
    },
  },
});

export default defineConfig({
  // GitHub Pages serves the project from /finbox/
  base: "/finbox/",
  plugins: [htmlPartials()],
  build: {
    rolldownOptions: {
      input: Object.fromEntries(
        Object.entries(PAGES).map(([name, file]) => [name, root(`./${file}`)]),
      ),
    },
  },
  test: {
    // Playwright specs (tests/e2e/*.spec.js) are not Vitest tests
    include: ["tests/unit/**/*.test.js"],
    // A UTC-negative zone makes date-only strings shift a day if parsed as local time
    env: { TZ: "America/New_York" },
  },
});
