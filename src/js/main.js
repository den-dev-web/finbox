import initDropdowns from "./modules/dropdown.js";
import initMetrics from "./modules/metrics.js";
import initCharts from "./modules/charts.js";
import initTable from "./modules/table.js";
import initStore from "./state/store.js";
import initThemeToggle from "./modules/theme.js";
import initReveal from "./modules/reveal.js";
import initSidebar from "./modules/sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  initDropdowns();
  initMetrics();
  initCharts();
  initTable();
  initStore();
  initThemeToggle();
  initReveal();
  initSidebar();
});
