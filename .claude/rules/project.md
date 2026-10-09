# FinBox — project passport

- **Type:** static multi-page site (Vite), no CMS. Deployed to GitHub Pages at `/finbox/`.
- **Browser support target:** last 2 Chrome / Edge / Firefox, **Safari & iOS >= 16.4** (raised from the global default 15 on 2026-10-09 to use `@layer`, container queries, `oklch()` and media range syntax without fallbacks). Check features with `python3 ~/.claude/scripts/compat.py <feature> --target safari=16.4,safari_ios=16.4`.
- **Breakpoints in use:** 560 / 720 / 1024 (sidebar becomes static) / 1280 (four-column grid). Global checkpoints 320–1400 are guarded by `tests/e2e/layout.spec.js`.
- **Container max width:** 1200px (`.o-container`).
- **SEO:** meta, canonical and Open Graph are written by hand per page; shared tags live in `src/partials/head-common.html`.
