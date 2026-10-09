import { getReports } from "../data/api.js";
import { displayCurrency, formatMoney } from "../utils/format.js";
import { categoryShares, reportCsv, summarize } from "./reports/model.js";
import {
  formatRate,
  renderBarChart,
  renderCategories,
  renderMonthLabels,
  renderMonthRows,
} from "./reports/render.js";

/** @typedef {import("../types").ReportsData} ReportsData */

/** @param {string} selector */
const query = (selector) =>
  /** @type {HTMLElement | null} */ (document.querySelector(selector));

/**
 * Offers text as a file download.
 * @param {string} fileName
 * @param {string} content
 */
const downloadFile = (fileName, content) => {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export default function initReports() {
  const cards = /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll("[data-report-card]"),
  ]);
  const exportButton = /** @type {HTMLButtonElement | null} */ (
    query("[data-report-export]")
  );
  if (cards.length === 0) {
    return;
  }

  /** @type {ReportsData | null} */
  let data = null;

  /** @param {"loading" | "default" | "error"} state */
  const setState = (state) => {
    cards.forEach((card) => {
      card.dataset.state = state;
    });
  };

  /** @param {ReportsData} reports */
  const render = (reports) => {
    const totals = summarize(reports.months);
    /** @type {Record<string, string>} */
    const values = {
      income: formatMoney(totals.income),
      expense: formatMoney(totals.expense),
      net: formatMoney(totals.net),
      savings: formatRate(totals.savingsRate),
    };
    document.querySelectorAll("[data-report-total]").forEach((element) => {
      const key = /** @type {HTMLElement} */ (element).dataset.reportTotal;
      element.textContent = key ? values[key] : "";
    });

    const svg = /** @type {SVGSVGElement | null} */ (
      document.querySelector("[data-report-chart]")
    );
    const labels = query("[data-report-labels]");
    const categories = query("[data-report-categories]");
    const rows = /** @type {HTMLTableSectionElement | null} */ (
      query("[data-report-rows]")
    );
    if (svg) {
      renderBarChart(svg, reports.months);
    }
    if (labels) {
      renderMonthLabels(labels, reports.months);
    }
    if (categories) {
      renderCategories(categories, categoryShares(reports.categories));
    }
    if (rows) {
      renderMonthRows(rows, reports.months);
    }
    document.querySelectorAll(".c-chart__unit").forEach((unit) => {
      unit.textContent = displayCurrency();
    });
  };

  const load = async () => {
    setState("loading");
    if (exportButton) {
      exportButton.disabled = true;
    }
    try {
      data = await getReports();
      render(data);
      setState("default");
      if (exportButton) {
        exportButton.disabled = false;
      }
    } catch {
      setState("error");
    }
  };

  exportButton?.addEventListener("click", () => {
    if (!data) {
      return;
    }
    const { months } = data;
    const range = `${months[0].month}_${months[months.length - 1].month}`;
    downloadFile(
      `finbox-report-${range}-${displayCurrency()}.csv`,
      reportCsv(months, displayCurrency()),
    );
  });

  query("[data-report-retry]")?.addEventListener("click", load);

  load();
}
