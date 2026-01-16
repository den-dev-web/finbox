const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const sorters = {
  date: (a, b) => new Date(a.date) - new Date(b.date),
  amount: (a, b) => a.amount - b.amount,
};

const applySort = (data, key, direction) => {
  const sorted = [...data].sort(sorters[key]);
  return direction === "asc" ? sorted : sorted.reverse();
};

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

  const formatAmount = (value) => formatCurrency.format(value);
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
    const overflowIfRight =
      triggerRect.right - menuRect.width - margin < 0;
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

  const normalizeValue = (field, row) => {
    if (field === "date") {
      return formatDate.format(new Date(row.date));
    }
    if (field === "amount") {
      return formatAmount(row.amount);
    }
    return row[field] ?? "";
  };

  const isFiltering = () =>
    Object.values(state.filters).some((value) => value);

  const applyFilters = (rows) => {
    const activeFields = Object.entries(state.filters).filter(
      ([, value]) => value
    );
    if (activeFields.length === 0) {
      return rows;
    }
    return rows.filter((row) =>
      activeFields.every(([field, value]) => normalizeValue(field, row) === value)
    );
  };

  const getPageCount = (rows) =>
    Math.max(1, Math.ceil(rows.length / state.pageSize));

  const clampPage = (page, pageCount) =>
    Math.min(Math.max(page, 1), pageCount);

  const renderFilters = (rows) => {
    if (!filtersContainer) {
      return;
    }
    filtersContainer.innerHTML = "";

    const valuesByField = {
      date: new Set(),
      category: new Set(),
      description: new Set(),
      amount: new Set(),
    };

    rows.forEach((row) => {
      Object.keys(valuesByField).forEach((field) => {
        valuesByField[field].add(normalizeValue(field, row));
      });
    });

    Object.keys(valuesByField).forEach((field) => {
      const values = [...valuesByField[field]];
      const filter = document.createElement("div");
      filter.className = "c-table__filter";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "c-table__filter-chip";
      trigger.setAttribute("data-filter-trigger", field);
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.textContent = `${fieldLabels[field]}: All`;

      const menu = document.createElement("div");
      menu.className = "c-table__filter-menu";
      menu.setAttribute("role", "listbox");
      menu.setAttribute("data-filter-menu", field);

      const allOption = document.createElement("button");
      allOption.type = "button";
      allOption.className = "c-table__filter-option";
      allOption.setAttribute("role", "option");
      allOption.setAttribute("data-filter-option", field);
      allOption.setAttribute("data-filter-value", "");
      allOption.textContent = "All";
      menu.appendChild(allOption);

      values.forEach((value) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "c-table__filter-option";
        option.setAttribute("role", "option");
        option.setAttribute("data-filter-option", field);
        option.setAttribute("data-filter-value", value);
        option.textContent = value;
        menu.appendChild(option);
      });

      filter.appendChild(trigger);
      filter.appendChild(menu);
      filtersContainer.appendChild(filter);
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
      resetFiltersButton.disabled = !isFiltering();
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
        button.setAttribute(
          "aria-sort",
          state.sortDirection === "asc" ? "ascending" : "descending"
        );
        const indicator = button.querySelector(".c-table__sort-indicator");
        if (indicator) {
          indicator.textContent = state.sortDirection === "asc" ? "↑" : "↓";
        }
      } else {
        button.setAttribute("aria-sort", "none");
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

    const filtered = applyFilters(state.rows);
    const sorted = applySort(filtered, state.sortKey, state.sortDirection);
    const pageCount = getPageCount(sorted);
    state.page = clampPage(state.page, pageCount);
    const start = (state.page - 1) * state.pageSize;
    const pageRows = sorted.slice(start, start + state.pageSize);

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
      const tr = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = formatDate.format(new Date(row.date));
      dateCell.className = "c-table__date";

      const categoryCell = document.createElement("td");
      categoryCell.textContent = row.category;
      categoryCell.className = "c-table__category";

      const descCell = document.createElement("td");
      descCell.textContent = row.description;
      descCell.className = "c-table__description";

      const amountCell = document.createElement("td");
      amountCell.textContent = formatCurrency.format(row.amount);
      amountCell.className = `c-table__amount ${
        row.amount >= 0
          ? "c-table__amount--positive"
          : "c-table__amount--negative"
      }`;

      const actionCell = document.createElement("td");
      actionCell.className = "c-table__actions";

      const menuId = `action-menu-${index}`;

      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.className = "c-table__action-toggle";
      actionButton.setAttribute("aria-haspopup", "menu");
      actionButton.setAttribute("aria-expanded", "false");
      actionButton.setAttribute("aria-controls", menuId);
      actionButton.setAttribute("data-action-toggle", "true");
      actionButton.textContent = "⋮";

      const actionMenu = document.createElement("div");
      actionMenu.className = "c-table__action-menu";
      actionMenu.id = menuId;
      actionMenu.setAttribute("role", "menu");
      actionMenu.setAttribute("data-action-menu", "true");

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "c-table__action-item";
      editButton.setAttribute("role", "menuitem");
      editButton.setAttribute("data-action-item", "edit");
      editButton.textContent = "Edit";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "c-table__action-item";
      deleteButton.setAttribute("role", "menuitem");
      deleteButton.setAttribute("data-action-item", "delete");
      deleteButton.textContent = "Delete";

      actionMenu.appendChild(editButton);
      actionMenu.appendChild(deleteButton);
      actionCell.appendChild(actionButton);
      actionCell.appendChild(actionMenu);

      tr.appendChild(dateCell);
      tr.appendChild(categoryCell);
      tr.appendChild(descCell);
      tr.appendChild(amountCell);
      tr.appendChild(actionCell);
      body.appendChild(tr);

      if (cards) {
        const cardItem = document.createElement("div");
        cardItem.className = "c-table__card";

        const header = document.createElement("div");
        header.className = "c-table__card-header";

        const meta = document.createElement("div");
        meta.className = "c-table__card-meta";

        const category = document.createElement("span");
        category.textContent = row.category;
        category.className = "c-table__category";

        const date = document.createElement("span");
        date.textContent = formatDate.format(new Date(row.date));
        date.className = "c-table__date";

        meta.appendChild(category);
        meta.appendChild(date);

        const amountWrap = document.createElement("div");
        amountWrap.className = "c-table__card-amount";

        const amount = document.createElement("span");
        amount.textContent = formatCurrency.format(row.amount);
        amount.className = `c-table__amount ${
          row.amount >= 0
            ? "c-table__amount--positive"
            : "c-table__amount--negative"
        }`;

        const actions = document.createElement("div");
        actions.className = "c-table__card-actions";

        const cardMenuId = `action-menu-card-${index}`;

        const actionButton = document.createElement("button");
        actionButton.type = "button";
        actionButton.className = "c-table__action-toggle";
        actionButton.setAttribute("aria-haspopup", "menu");
        actionButton.setAttribute("aria-expanded", "false");
        actionButton.setAttribute("aria-controls", cardMenuId);
        actionButton.setAttribute("data-action-toggle", "true");
        actionButton.textContent = "⋮";

        const actionMenu = document.createElement("div");
        actionMenu.className = "c-table__action-menu";
        actionMenu.id = cardMenuId;
        actionMenu.setAttribute("role", "menu");
        actionMenu.setAttribute("data-action-menu", "true");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "c-table__action-item";
        editButton.setAttribute("role", "menuitem");
        editButton.setAttribute("data-action-item", "edit");
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "c-table__action-item";
        deleteButton.setAttribute("role", "menuitem");
        deleteButton.setAttribute("data-action-item", "delete");
        deleteButton.textContent = "Delete";

        actionMenu.appendChild(editButton);
        actionMenu.appendChild(deleteButton);
        actions.appendChild(actionButton);
        actions.appendChild(actionMenu);

        amountWrap.appendChild(amount);
        amountWrap.appendChild(actions);

        header.appendChild(meta);
        header.appendChild(amountWrap);

        const description = document.createElement("p");
        description.textContent = row.description;
        description.className = "c-table__description";

        cardItem.appendChild(header);
        cardItem.appendChild(description);
        cards.appendChild(cardItem);
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
      if (state.sortKey === key) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDirection = key === "amount" ? "desc" : "asc";
      }
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
        `[data-filter-menu="${field}"]`
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
      const filtered = applyFilters(state.rows);
      const sorted = applySort(filtered, state.sortKey, state.sortDirection);
      state.page = getPageCount(sorted);
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
        new CustomEvent("period:change", { detail: { period: state.period } })
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
