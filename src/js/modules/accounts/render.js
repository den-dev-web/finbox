// DOM builders for the Accounts page.
import { formatMoney } from "../../utils/format.js";
import { ACCOUNT_TYPES } from "./model.js";

/** @typedef {import("../../types").Account} Account */

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {string} className
 * @param {string} text
 */
const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
};

/** @param {Account} account */
export const createAccountCard = (account) => {
  const header = createElement("div", "c-account__header", "");
  header.append(
    createElement("h3", "c-account__name", account.name),
    createElement("span", "c-account__type", ACCOUNT_TYPES[account.type]),
  );

  const balance = createElement(
    "p",
    `c-account__balance${account.balance < 0 ? " c-account__balance--negative" : ""}`,
    formatMoney(account.balance, { cents: true }),
  );

  const item = createElement("li", "c-account", "");
  item.append(
    header,
    // Cash has no institution; keep the row so cards line up
    createElement("p", "c-account__institution", account.institution || "—"),
    balance,
  );
  return item;
};

/** @param {number} count */
export const accountCountText = (count) =>
  `${count} ${count === 1 ? "account" : "accounts"}`;
