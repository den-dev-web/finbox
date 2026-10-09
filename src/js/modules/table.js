import {
  FILTER_FIELDS,
  applyFilters,
  applySort,
  collectFilterValues,
  getPageCount,
  isFiltering,
  nextSort,
  paginate,
} from "./table/model.js";
import { createCard, createFilter, createRow } from "./table/render.js";

export default function initTable() {
  const card = document.querySelector("[data-table-card]");
  if (!card) {
    return;
  }

  const body = card.querySelector("[data-table-body]");
  const cards = card.querySelector("[data-table-cards]");
  const emptyCards = card.querySelector("[data-table-empty-card]");
  const emptyState = card.querySelector("[data-table-empty]");
  const head = card.querySelector(".c-table__head");
  const sortButtons = [...card.querySelectorAll("[data-sort-key]")];
  const retryButton = card.querySelector(".c-table__retry");
  const filtersContainer = card.querySelector("[data-table-filters]");
  const resetFiltersButton = card.querySelector("[data-table-filter-reset]");
  const pagination = card.querySelector("[data-table-pagination]");
  const pageInfo = card.querySelector("[data-page-info]");
  const pageSummary = card.querySelector("[data-page-summary]");
  const pagePrev = card.querySelector("[data-page-prev]");
  const pageNext = card.querySelector("[data-page-next]");
  const pageFirst = card.querySelector("[data-page-first]");
  const pageLast = card.querySelector("[data-page-last]");
  const pageSizeSelect = card.querySelector("[data-page-size]");

  const state = {
    period: "month",
    sortKey: "date",
    sortDirection: "desc",
    rows: [],
    page: 1,
    pageSize: 10,
    filters: {
      date: null,
      category: null,
      description: null,
      amount: null,
    },
  };

  const fieldLabels = {
    date: "Date",
    category: "Category",
    description: "Description",
    amount: "Amount",
  };

  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const alignMenu = (menu, trigger, preferRight = false) => {
    if (!isMobile()) {
      menu.style.position = "";
      menu.style.left = "";
      menu.style.right = "";
      return;
    }

    const menuRect = menu.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 8;
    const overflowIfLeft =
      triggerRect.left + menuRect.width + margin > viewportWidth;
    const overflowIfRight = triggerRect.right - menuRect.width - margin < 0;
    let alignRight = preferRight;

    if (alignRight && overflowIfRight && !overflowIfLeft) {
      alignRight = false;
    } else if (!alignRight && overflowIfLeft && !overflowIfRight) {
      alignRight = true;
    }

    menu.style.position = "absolute";
    menu.style.left = alignRight ? "auto" : "0";
    menu.style.right = alignRight ? "0" : "auto";
  };

  const renderFilters = (rows) => {
    if (!filtersContainer) {
      return;
    }
    filtersContainer.innerHTML = "";
    const valuesByField = collectFilterValues(rows);
    FILTER_FIELDS.forEach((field) => {
      filtersContainer.appendChild(
        createFilter(field, fieldLabels[field], valuesByField[field]),
      );
    });

    updateFilterUI();
  };

  const updateFilterUI = () => {
    if (!filtersContainer) {
      return;
    }
    const triggers = [
      ...filtersContainer.querySelectorAll("[data-filter-trigger]"),
    ];
    triggers.forEach((trigger) => {
      const field = trigger.getAttribute("data-filter-trigger");
      if (!field) {
        return;
      }
      const value = state.filters[field];
      trigger.textContent = `${fieldLabels[field]}: ${value || "All"}`;
      trigger.classList.toggle("is-active", Boolean(value));
    });

    const options = [
      ...filtersContainer.querySelectorAll("[data-filter-option]"),
    ];
    options.forEach((option) => {
      const field = option.getAttribute("data-filter-option");
      const value = option.getAttribute("data-filter-value") || "";
      if (!field) {
        return;
      }
      const isSelected =
        (value === "" && !state.filters[field]) ||
        state.filters[field] === value;
      option.classList.toggle("is-active", isSelected);
    });

    if (resetFiltersButton) {
      resetFiltersButton.disabled = !isFiltering(state.filters);
    }
  };

  const clearFilters = () => {
    Object.keys(state.filters).forEach((field) => {
      state.filters[field] = null;
    });
    updateFilterUI();
  };

  const closeActionMenus = () => {
    const menus = card.querySelectorAll("[data-action-menu]");
    menus.forEach((menu) => {
      menu.classList.remove("is-open");
    });
    const toggles = card.querySelectorAll("[data-action-toggle]");
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
    });
  };

  const closeFilterMenus = () => {
    if (!filtersContainer) {
      return;
    }
    const menus = filtersContainer.querySelectorAll("[data-filter-menu]");
    menus.forEach((menu) => menu.classList.remove("is-open"));
    const triggers = filtersContainer.querySelectorAll("[data-filter-trigger]");
    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
  };

  const updateSortUI = () => {
    sortButtons.forEach((button) => {
      const key = button.dataset.sortKey;
      if (key === state.sortKey) {
        button
          .closest("th")
          ?.setAttribute(
            "aria-sort",
            state.sortDirection === "asc" ? "ascending" : "descending",
          );
        const indicator = button.querySelector(".c-table__sort-indicator");
        if (indicator) {
          indicator.textContent = state.sortDirection === "asc" ? "↑" : "↓";
        }
      } else {
        button.closest("th")?.setAttribute("aria-sort", "none");
        const indicator = button.querySelector(".c-table__sort-indicator");
        if (indicator) {
          indicator.textContent = "↕";
        }
      }
    });
  };

  const render = () => {
    if (!body) {
      return;
    }
    body.innerHTML = "";
    if (cards) {
      cards.innerHTML = "";
    }
    closeActionMenus();
    closeFilterMenus();

    const filtered = applyFilters(state.rows, state.filters);
    const sorted = applySort(filtered, state.sortKey, state.sortDirection);
    const { page, pageCount, start, pageRows } = paginate(
      sorted,
      state.page,
      state.pageSize,
    );
    state.page = page;

    if (pageRows.length === 0) {
      if (emptyState) {
        emptyState.hidden = false;
      }
      if (emptyCards) {
        emptyCards.hidden = false;
      }
      if (pagination) {
        pagination.hidden = sorted.length === 0;
      }
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }
    if (emptyCards) {
      emptyCards.hidden = true;
    }

    pageRows.forEach((row, index) => {
      body.appendChild(createRow(row, index));
      if (cards) {
        cards.appendChild(createCard(row, index));
      }
    });

    if (pagination) {
      pagination.hidden = sorted.length === 0;
    }
    if (pageInfo) {
      pageInfo.textContent = `Page ${state.page} of ${pageCount}`;
    }
    if (pageSummary) {
      const shownStart = sorted.length === 0 ? 0 : start + 1;
      const shownEnd = sorted.length === 0 ? 0 : start + pageRows.length;
      pageSummary.textContent = `Showing ${shownStart}–${shownEnd} of ${sorted.length}`;
    }
    if (pagePrev) {
      pagePrev.disabled = state.page <= 1;
    }
    if (pageNext) {
      pageNext.disabled = state.page >= pageCount;
    }
    if (pageFirst) {
      pageFirst.disabled = state.page <= 1;
    }
    if (pageLast) {
      pageLast.disabled = state.page >= pageCount;
    }
  };

  const setLoading = () => {
    card.dataset.state = "loading";
    if (emptyState) {
      emptyState.hidden = true;
    }
  };

  if (head) {
    head.addEventListener("click", (event) => {
      const button = event.target.closest("[data-sort-key]");
      if (!button) {
        return;
      }
      const key = button.dataset.sortKey;
      if (!key) {
        return;
      }
      Object.assign(state, nextSort(state, key));
      state.page = 1;
      render();
      updateSortUI();
    });
  }

  card.addEventListener("click", (event) => {
    const filterTrigger = event.target.closest("[data-filter-trigger]");
    if (filterTrigger && filtersContainer?.contains(filterTrigger)) {
      event.preventDefault();
      const field = filterTrigger.getAttribute("data-filter-trigger");
      if (!field) {
        return;
      }
      const menu = filtersContainer.querySelector(
        `[data-filter-menu="${field}"]`,
      );
      if (!menu) {
        return;
      }
      const isOpen = menu.classList.contains("is-open");
      closeFilterMenus();
      if (!isOpen) {
        menu.style.visibility = "hidden";
        menu.classList.add("is-open");
        filterTrigger.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => {
          alignMenu(menu, filterTrigger);
          menu.style.visibility = "";
        });
      }
      return;
    }

    const filterOption = event.target.closest("[data-filter-option]");
    if (filterOption && filtersContainer?.contains(filterOption)) {
      event.preventDefault();
      const field = filterOption.getAttribute("data-filter-option");
      const value = filterOption.getAttribute("data-filter-value") || "";
      if (!field) {
        return;
      }
      state.filters[field] = value || null;
      updateFilterUI();
      state.page = 1;
      render();
      closeFilterMenus();
      return;
    }

    const toggle = event.target.closest("[data-action-toggle]");
    if (toggle) {
      event.preventDefault();
      const menuId = toggle.getAttribute("aria-controls");
      const menu = menuId ? card.querySelector(`#${menuId}`) : null;
      if (!menu) {
        return;
      }
      const isOpen = menu.classList.contains("is-open");
      closeActionMenus();
      if (!isOpen) {
        menu.style.visibility = "hidden";
        menu.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        requestAnimationFrame(() => {
          alignMenu(menu, toggle, true);
          menu.style.visibility = "";
        });
      }
      return;
    }

    if (event.target.closest("[data-action-item]")) {
      closeActionMenus();
    }
  });

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", () => {
      clearFilters();
      state.page = 1;
      render();
    });
  }

  if (pagePrev) {
    pagePrev.addEventListener("click", () => {
      state.page = Math.max(1, state.page - 1);
      render();
    });
  }

  if (pageFirst) {
    pageFirst.addEventListener("click", () => {
      state.page = 1;
      render();
    });
  }

  if (pageNext) {
    pageNext.addEventListener("click", () => {
      state.page += 1;
      render();
    });
  }

  if (pageLast) {
    pageLast.addEventListener("click", () => {
      state.page = getPageCount(
        applyFilters(state.rows, state.filters).length,
        state.pageSize,
      );
      render();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", () => {
      const nextSize = Number(pageSizeSelect.value);
      if (!Number.isNaN(nextSize) && nextSize > 0) {
        state.pageSize = nextSize;
        state.page = 1;
        render();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (!card.contains(event.target)) {
      closeActionMenus();
      closeFilterMenus();
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const inFilterMenu = target.closest("[data-filter-menu]");
    const inFilterTrigger = target.closest("[data-filter-trigger]");
    const inActionMenu = target.closest("[data-action-menu]");
    const inActionToggle = target.closest("[data-action-toggle]");

    if (!inFilterMenu && !inFilterTrigger) {
      closeFilterMenus();
    }

    if (!inActionMenu && !inActionToggle) {
      closeActionMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeActionMenus();
      closeFilterMenus();
    }
  });

  if (retryButton) {
    retryButton.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("period:change", { detail: { period: state.period } }),
      );
    });
  }

  document.addEventListener("period:change", (event) => {
    if (event.detail?.period) {
      state.period = event.detail.period;
      setLoading();
    }
  });

  document.addEventListener("data:loaded", (event) => {
    const data = event.detail?.data;
    if (!data) {
      return;
    }
    state.rows = Array.isArray(data.transactions) ? data.transactions : [];
    card.dataset.state = "default";
    state.page = 1;
    renderFilters(state.rows);
    render();
    updateSortUI();
  });

  document.addEventListener("data:error", () => {
    card.dataset.state = "error";
  });

  setLoading();
}
