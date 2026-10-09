import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = (path) => fileURLToPath(new URL(path, import.meta.url));

// Pages by nav name; nested index.html files give clean URLs (/finbox/reports/)
const PAGES = {
  dashboard: "index.html",
  reports: "reports/index.html",
};

const INCLUDE_PATTERN = /<!-- @include ([\w-]+) -->/g;
const BLOCK_PATTERN =
  /<!-- @block ([\w-]+)((?: [\w-]+="[^"]*")*) -->([\s\S]*?)<!-- @endblock -->/g;
const PARAM_PATTERN = / ([\w-]+)="([^"]*)"/g;
const PLACEHOLDER_PATTERN = /\{\{([\w-]+)\}\}/g;
const NAV_PATTERN = / data-nav="([\w-]+)"/g;

const readPartial = (name) =>
  readFileSync(root(`./src/partials/${name}.html`), "utf8");

// Fills {{param}} placeholders and the <!-- @slot --> of a block partial;
// a missing parameter fails the build instead of shipping "{{title}}"
const renderBlock = (name, paramsSource, slot) => {
  const params = Object.fromEntries(
    [...paramsSource.matchAll(PARAM_PATTERN)].map(([, key, value]) => [
      key,
      value,
    ]),
  );
  return readPartial(name)
    .replace(PLACEHOLDER_PATTERN, (_, key) => {
      if (!(key in params)) {
        throw new Error(`Partial "${name}" needs the "${key}" parameter`);
      }
      return params[key];
    })
    .replace("<!-- @slot -->", slot.trim());
};

// "/index.html" -> "dashboard", "/reports/index.html" -> "reports"
const pageName = (path) =>
  path === "/index.html" ? "dashboard" : path.split("/")[1];

/**
 * Inlines shared markup from src/partials/<name>.html:
 * - `<!-- @include name -->` inserts the partial as is;
 * - `<!-- @block name key="value" -->slot<!-- @endblock -->` also fills
 *   {{key}} placeholders and puts the slot content at `<!-- @slot -->`.
 * Then the current page's `data-nav` link becomes `aria-current="page"`.
 */
const htmlPartials = () => ({
  name: "finbox-html-partials",
  transformIndexHtml: {
    order: "pre",
    handler(html, { path }) {
      const page = pageName(path);
      return html
        .replace(BLOCK_PATTERN, (_, name, params, slot) =>
          renderBlock(name, params, slot),
        )
        .replace(INCLUDE_PATTERN, (_, name) => readPartial(name))
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
