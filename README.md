# FinBox

A financial analytics dashboard built with vanilla JavaScript, modern CSS and no runtime dependencies.

🔗 **Live demo:** https://den-dev-web.github.io/finbox/

![FinBox dashboard](public/og-image.png)

---

## 📄 Pages

| Page                                                       | What it does                                                                                                             |
| :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| [Dashboard](https://den-dev-web.github.io/finbox/)         | Metrics, line and doughnut charts, transactions table with sorting, filters and pagination for day / week / month / year |
| [Reports](https://den-dev-web.github.io/finbox/reports/)   | Yearly totals, savings rate, grouped bar chart, spending by category, CSV export                                         |
| [Accounts](https://den-dev-web.github.io/finbox/accounts/) | Balances, search, “Add account” dialog with validation; new accounts persist in the browser                              |
| [Settings](https://den-dev-web.github.io/finbox/settings/) | Theme (system / light / dark), currency with conversion, default period, table density                                   |

## ✨ Features

- **SVG charts drawn from scratch** — line, doughnut and grouped bar charts without a chart library
- **Currency conversion** — USD data shown in USD, EUR or UAH with fixed demo rates; CSV export follows the setting
- **Themes** — follow the OS live or stay light / dark; applied before first paint, so no flash
- **Loading, error and empty states** for every widget; skeletons keep the layout still
- **Accessible forms and widgets** — labelled fields with inline errors, focus management in the dialog, listbox keyboard pattern, WCAG AA contrast
- **Page transitions** — cross-document View Transitions where supported, plain navigation elsewhere
- **Resilient** — works with blocked storage (private modes) and in Safari 15 without `<dialog>` support

Append `?fail=1` to the URL to see the error states.

---

## 📊 Lighthouse

Measured on the live demo for all four pages.

| Profile | Performance | Accessibility | Best Practices | SEO |
| :------ | :---------: | :-----------: | :------------: | :-: |
| Mobile  |   98–100    |      100      |      100       | 100 |
| Desktop |     100     |      100      |      100       | 100 |

- **Layout stays still (CLS ≤ 0.004, “good” is < 0.1):** skeletons reserve the final size of every widget.
- **WCAG AA contrast** in both themes: text colors are separate tokens with a verified 4.5:1 ratio.

------ | :---------: | :-----------: | :------------: | :-: |
| Mobile | 98+ | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

- **No layout shift (CLS 0):** skeletons reserve the final size of every widget.
- **WCAG AA contrast** in both themes: text colors are separate tokens with a verified 4.5:1 ratio.

---

## ⚙️ Tech Stack

| Area           | Tools                                                                                  |
| :------------- | :------------------------------------------------------------------------------------- |
| Markup & logic | HTML5, CSS, JavaScript (ES modules) — no frameworks, no runtime dependencies           |
| Build          | Vite                                                                                   |
| Code quality   | ESLint, Stylelint, Prettier, TypeScript strict `checkJs` (JSDoc types)                 |
| Testing        | Vitest (unit), Playwright (smoke, axe accessibility, visual regression), html-validate |
| CI/CD          | GitHub Actions → GitHub Pages                                                          |
| Browsers       | Last 2 Chrome, Edge, Firefox; Safari and iOS 16.4+                                     |

---

## 🧩 Architecture

**CSS — ITCSS layers with namespaced BEM.** Styles go from generic to specific: `settings` (design tokens) → `generic` (reset) → `elements` → `objects` (`o-` layout) → `components` (`c-`) → `utilities` (`u-`). States use `is-` classes and `data-state` attributes. Stylelint enforces the naming.

**Design tokens.** Colors, spacing, radii, shadows and motion are CSS custom properties. The dark theme works by redefining tokens under `[data-theme="dark"]`.

**Multi-page build with shared markup.** Vite builds one HTML page per section with clean URLs. A small plugin in `vite.config.js` inlines shared partials (head, sidebar, header with a title parameter and an actions slot) and marks the current page in the navigation; a missing parameter fails the build.

**Event-driven dashboard.** Widgets never import each other. The store is the only owner of the current period: it announces `data:loading`, `data:loaded` and `data:error`; widgets ask for `period:change` or `data:retry`.

**Pure logic, thin views.** Sorting, filtering, pagination, report maths, CSV, validation and currency conversion live in DOM-free modules covered by unit tests; render and controller modules only touch the DOM.

**Settings.** One validated object in `localStorage` (theme, currency, default period, density). An inline head script applies theme and density before first paint; every storage call fails soft.

**Mock API.** `src/js/data/api.js` simulates latency over static JSON files, so the UI handles real async states.

```
index.html, reports/, accounts/, settings/   # pages
src/
├── partials/      # shared head, sidebar, header
├── js/
│   ├── pages/     # entry point per page (+ main.js for the dashboard)
│   ├── data/      # mock API
│   ├── state/     # store, settings
│   ├── utils/     # money formatting, safe storage
│   └── modules/   # widgets; */model.js = pure logic, */render.js = DOM
└── styles/        # ITCSS layers: settings → generic → elements → objects → components → utilities
public/data/       # mock datasets
tests/unit/        # Vitest
tests/e2e/         # Playwright: smoke, accessibility, HTML, layout, visual
```

---

## 🧪 Local Development

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
npm run dev        # dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm run lint       # ESLint + Stylelint + Prettier check
npm run typecheck  # TypeScript strict check of JSDoc types
npm run format     # auto-fix formatting
npm run test:unit  # unit tests for the pure logic modules
npm run test:e2e   # smoke, accessibility, HTML and no-horizontal-scroll tests
npm run test:visual # screenshots of every page: 3 browsers × 3 widths × 2 themes
```

Tests run in the official Playwright container (Podman locally, GitHub Actions in CI), so screenshots are pixel-identical everywhere. Every pull request runs lint, build and all tests; a push to `main` deploys to GitHub Pages only when they pass.
