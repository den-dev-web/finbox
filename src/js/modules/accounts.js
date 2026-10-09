import { getAccounts } from "../data/api.js";
import { storage } from "../utils/storage.js";
import { formatMoney } from "../utils/format.js";
import {
  filterAccounts,
  parseStoredAccounts,
  totalBalance,
} from "./accounts/model.js";
import { accountCountText, createAccountCard } from "./accounts/render.js";

/** @typedef {import("../types").Account} Account */

// Accounts added in the browser; the demo data stays read-only
export const USER_ACCOUNTS_KEY = "finbox-accounts";

/** @param {string} selector */
const query = (selector) =>
  /** @type {HTMLElement | null} */ (document.querySelector(selector));

export default function initAccounts() {
  const cards = /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll("[data-accounts-card]"),
  ]);
  const list = query("[data-account-list]");
  const search = /** @type {HTMLInputElement | null} */ (
    query("[data-account-search]")
  );
  const count = query("[data-account-count]");
  const empty = query("[data-account-empty]");
  const total = query("[data-account-total]");
  const summary = query("[data-account-summary]");
  if (cards.length === 0 || !list) {
    return null;
  }

  /** @type {Account[]} */
  let accounts = [];

  /** @param {"loading" | "default" | "error"} state */
  const setState = (state) => {
    cards.forEach((card) => {
      card.dataset.state = state;
    });
  };

  const renderList = () => {
    const visible = filterAccounts(accounts, search?.value ?? "");
    list.replaceChildren(...visible.map(createAccountCard));
    if (empty) {
      empty.hidden = visible.length > 0;
    }
    if (count) {
      count.textContent =
        visible.length === accounts.length
          ? accountCountText(accounts.length)
          : `${visible.length} of ${accountCountText(accounts.length)}`;
    }
  };

  const renderTotals = () => {
    if (total) {
      total.textContent = formatMoney(totalBalance(accounts), { cents: true });
    }
    if (summary) {
      summary.textContent = `Across ${accountCountText(accounts.length)}.`;
    }
  };

  const load = async () => {
    setState("loading");
    try {
      const { accounts: demo } = await getAccounts();
      accounts = [
        ...demo,
        ...parseStoredAccounts(storage.get(USER_ACCOUNTS_KEY)),
      ];
      renderTotals();
      renderList();
      setState("default");
    } catch {
      setState("error");
    }
  };

  search?.addEventListener("input", renderList);
  query("[data-account-retry]")?.addEventListener("click", load);
  load();

  return {
    /**
     * Adds an account, keeps it in this browser and re-renders.
     * @param {Account} account
     * @returns {boolean} false when it could not be stored (shown for this visit only)
     */
    add(account) {
      const stored = [
        ...parseStoredAccounts(storage.get(USER_ACCOUNTS_KEY)),
        account,
      ];
      accounts = [...accounts, account];
      renderTotals();
      renderList();
      return storage.set(USER_ACCOUNTS_KEY, stored);
    },
  };
}
