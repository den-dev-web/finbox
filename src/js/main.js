import initDropdowns from "./modules/dropdown.js";
import initMetrics from "./modules/metrics.js";
import initCharts from "./modules/charts.js";
import initTable from "./modules/table.js";
import initStore from "./state/store.js";
import initShell from "./shell.js";

document.addEventListener("DOMContentLoaded", () => {
  initDropdowns();
  initMetrics();
  initCharts();
  initTable();
  initStore();
  initShell();
});
