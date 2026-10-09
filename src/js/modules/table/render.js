// DOM builders for table rows, mobile cards and filter menus.
import { formatCurrency, formatDate } from "./model.js";

/** @typedef {import("../../types").Transaction} Transaction */

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {string} [className]
 * @param {string} [text]
 * @returns {HTMLElementTagNameMap[K]}
 */
const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

/**
 * @param {string} className
 * @param {string} text
 * @param {Record<string, string>} [attributes]
 */
const createButton = (className, text, attributes = {}) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  Object.entries(attributes).forEach(([name, value]) => {
    button.setAttribute(name, value);
  });
  return button;
};

/**
 * @param {"td" | "span"} tag
 * @param {number} amount
 */
const createAmount = (tag, amount) =>
  createElement(
    tag,
    `c-table__amount ${
      amount >= 0 ? "c-table__amount--positive" : "c-table__amount--negative"
    }`,
    formatCurrency.format(amount),
  );

// "⋮" toggle with an Edit / Delete menu; returns both so callers place them
/**
 * @param {string} menuId
 * @returns {[HTMLButtonElement, HTMLDivElement]}
 */
const createActionMenu = (menuId) => {
  const toggle = createButton("c-table__action-toggle", "⋮", {
    "aria-haspopup": "menu",
    "aria-expanded": "false",
    "aria-controls": menuId,
    "data-action-toggle": "true",
  });

  const menu = createElement("div", "c-table__action-menu");
  menu.id = menuId;
  menu.setAttribute("role", "menu");
  menu.setAttribute("data-action-menu", "true");
  [
    ["edit", "Edit"],
    ["delete", "Delete"],
  ].forEach(([action, label]) => {
    menu.appendChild(
      createButton("c-table__action-item", label, {
        role: "menuitem",
        "data-action-item": action,
      }),
    );
  });

  return [toggle, menu];
};

/**
 * @param {Transaction} row
 * @param {number} index position on the page, used for unique menu ids
 */
export const createRow = (row, index) => {
  const tr = document.createElement("tr");
  const actionCell = createElement("td", "c-table__actions");
  actionCell.append(...createActionMenu(`action-menu-${index}`));

  tr.append(
    createElement("td", "c-table__date", formatDate.format(new Date(row.date))),
    createElement("td", "c-table__category", row.category),
    createElement("td", "c-table__description", row.description),
    createAmount("td", row.amount),
    actionCell,
  );
  return tr;
};

// Mobile layout: the same row as a card
/**
 * @param {Transaction} row
 * @param {number} index position on the page, used for unique menu ids
 */
export const createCard = (row, index) => {
  const meta = createElement("div", "c-table__card-meta");
  meta.append(
    createElement("span", "c-table__category", row.category),
    createElement(
      "span",
      "c-table__date",
      formatDate.format(new Date(row.date)),
    ),
  );

  const actions = createElement("div", "c-table__card-actions");
  actions.append(...createActionMenu(`action-menu-card-${index}`));

  const amountWrap = createElement("div", "c-table__card-amount");
  amountWrap.append(createAmount("span", row.amount), actions);

  const header = createElement("div", "c-table__card-header");
  header.append(meta, amountWrap);

  const card = createElement("div", "c-table__card");
  card.append(
    header,
    createElement("p", "c-table__description", row.description),
  );
  return card;
};

// Filter chip with a listbox of values; the empty value means "All"
/**
 * @param {string} field
 * @param {string} label
 * @param {string[]} values
 */
export const createFilter = (field, label, values) => {
  const trigger = createButton("c-table__filter-chip", `${label}: All`, {
    "data-filter-trigger": field,
    "aria-expanded": "false",
    "aria-haspopup": "listbox",
  });

  const menu = createElement("div", "c-table__filter-menu");
  menu.setAttribute("role", "listbox");
  menu.setAttribute("data-filter-menu", field);
  [["", "All"], ...values.map((value) => [value, value])].forEach(
    ([value, text]) => {
      menu.appendChild(
        createButton("c-table__filter-option", text, {
          role: "option",
          "data-filter-option": field,
          "data-filter-value": value,
        }),
      );
    },
  );

  const filter = createElement("div", "c-table__filter");
  filter.append(trigger, menu);
  return filter;
};
