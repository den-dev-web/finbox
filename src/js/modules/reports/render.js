// DOM builders for the Reports page.
import { formatMoney } from "../../utils/format.js";
import { formatMonth, savingsRate } from "./model.js";

/** @typedef {import("../../types").MonthTotal} MonthTotal */
/** @typedef {import("../../types").CategoryTotal} CategoryTotal */

const SVG_NS = "http://www.w3.org/2000/svg";
const CHART = { width: 640, height: 220, padding: 12, gridLines: 4 };
// Each month gets a slot; two bars and the gap between them fill this share
const GROUP_FILL = 0.7;
const BAR_GAP = 3;
const BAR_RADIUS = 3;

/**
 * @param {string} name
 * @param {Record<string, string | number>} attributes
 */
const svgElement = (name, attributes) => {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
};

/** @param {number | null} rate */
const formatRate = (rate) => (rate === null ? "—" : `${rate.toFixed(1)}%`);

/** @param {number} value */
const signClass = (value) =>
  value < 0
    ? "c-report-table__value--negative"
    : "c-report-table__value--positive";

/**
 * Grouped bars per month, scaled to the largest value.
 * @param {SVGSVGElement} svg
 * @param {MonthTotal[]} months
 */
export const renderBarChart = (svg, months) => {
  const { width, height, padding, gridLines } = CHART;
  const plotHeight = height - padding * 2;
  const max = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1);
  const slot = (width - padding * 2) / months.length;
  const barWidth = (slot * GROUP_FILL - BAR_GAP) / 2;

  svg.replaceChildren();
  for (let i = 1; i <= gridLines; i += 1) {
    const y = padding + (plotHeight / gridLines) * i;
    svg.appendChild(
      svgElement("line", {
        x1: padding,
        x2: width - padding,
        y1: y,
        y2: y,
        class: "c-bar-chart__grid",
      }),
    );
  }

  months.forEach((month, index) => {
    const groupX = padding + slot * index + (slot * (1 - GROUP_FILL)) / 2;
    [
      ["income", month.income],
      ["expense", month.expense],
    ].forEach(([kind, value], barIndex) => {
      const barHeight = (Number(value) / max) * plotHeight;
      svg.appendChild(
        svgElement("rect", {
          x: groupX + barIndex * (barWidth + BAR_GAP),
          y: height - padding - barHeight,
          width: barWidth,
          height: barHeight,
          rx: BAR_RADIUS,
          class: `c-bar-chart__bar c-bar-chart__bar--${kind}`,
        }),
      );
    });
  });
};

/**
 * Short month names under the bars ("May", "Jun"...).
 * @param {HTMLElement} container
 * @param {MonthTotal[]} months
 */
export const renderMonthLabels = (container, months) => {
  container.style.setProperty("--chart-label-count", String(months.length));
  container.replaceChildren(
    ...months.map(({ month }) => {
      const label = document.createElement("div");
      label.textContent = formatMonth(month).split(" ")[0];
      return label;
    }),
  );
};

/**
 * @param {HTMLElement} list
 * @param {(CategoryTotal & { share: number })[]} shares
 */
export const renderCategories = (list, shares) => {
  list.replaceChildren(
    ...shares.map(({ category, amount, share }) => {
      const item = document.createElement("li");
      const row = document.createElement("div");
      row.className = "c-category-list__row";
      const name = document.createElement("span");
      name.className = "c-category-list__name";
      name.textContent = category;
      const value = document.createElement("span");
      value.className = "c-category-list__amount";
      value.textContent = `${formatMoney(amount)} · ${share.toFixed(1)}%`;
      row.append(name, value);

      const track = document.createElement("div");
      track.className = "c-category-list__track";
      track.setAttribute("aria-hidden", "true");
      const bar = document.createElement("div");
      bar.className = "c-category-list__bar";
      bar.style.width = `${share}%`;
      track.appendChild(bar);

      item.append(row, track);
      return item;
    }),
  );
};

/**
 * @param {HTMLTableSectionElement} body
 * @param {MonthTotal[]} months
 */
export const renderMonthRows = (body, months) => {
  body.replaceChildren(
    ...months.map(({ month, income, expense }) => {
      const net = income - expense;
      const row = document.createElement("tr");
      const cells = [
        [formatMonth(month), ""],
        [formatMoney(income), ""],
        [formatMoney(expense), ""],
        [formatMoney(net), signClass(net)],
        [formatRate(savingsRate(income, expense)), signClass(net)],
      ];
      cells.forEach(([text, className], index) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        if (index === 0) {
          cell.setAttribute("scope", "row");
        }
        cell.textContent = text;
        if (className) {
          cell.className = className;
        }
        row.appendChild(cell);
      });
      return row;
    }),
  );
};

export { formatRate };
