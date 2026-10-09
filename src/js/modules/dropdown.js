export default function initDropdowns() {
  const dropdowns = document.querySelectorAll("[data-dropdown]");
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  /**
   * On mobile, aligns the panel to the side where it fits the viewport.
   * @param {HTMLElement} panel
   * @param {HTMLElement} trigger
   */
  const alignPanel = (panel, trigger) => {
    if (!isMobile()) {
      panel.style.position = "";
      panel.style.left = "";
      panel.style.right = "";
      return;
    }

    const panelRect = panel.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 8;
    const overflowIfLeft =
      triggerRect.left + panelRect.width + margin > viewportWidth;
    const overflowIfRight = triggerRect.right - panelRect.width - margin < 0;
    let alignRight = false;

    if (overflowIfLeft && !overflowIfRight) {
      alignRight = true;
    }

    panel.style.position = "absolute";
    panel.style.left = alignRight ? "auto" : "0";
    panel.style.right = alignRight ? "0" : "auto";
  };

  dropdowns.forEach((dropdown) => {
    const trigger = /** @type {HTMLButtonElement | null} */ (
      dropdown.querySelector("[data-dropdown-trigger]")
    );
    const panel = /** @type {HTMLElement | null} */ (
      dropdown.querySelector("[data-dropdown-panel]")
    );
    const options = /** @type {HTMLButtonElement[]} */ ([
      ...dropdown.querySelectorAll(".c-dropdown__option"),
    ]);

    if (!trigger || !panel || options.length === 0) {
      return;
    }

    const close = () => {
      panel.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };

    const open = () => {
      panel.style.visibility = "hidden";
      panel.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        alignPanel(panel, trigger);
        panel.style.visibility = "";
      });
    };

    /** @param {number} nextIndex roving tabindex target */
    const setActiveIndex = (nextIndex) => {
      options.forEach((option, index) => {
        option.tabIndex = index === nextIndex ? 0 : -1;
      });
      options[nextIndex].focus();
    };

    const selectedIndex = () =>
      Math.max(
        0,
        options.findIndex(
          (option) => option.getAttribute("aria-selected") === "true",
        ),
      );

    trigger.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-open");
      if (isOpen) {
        close();
        return;
      }
      open();
      setActiveIndex(selectedIndex());
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }
      event.preventDefault();
      open();
      const currentIndex = selectedIndex();
      const nextIndex =
        event.key === "ArrowDown"
          ? Math.min(options.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
      setActiveIndex(nextIndex);
    });

    panel.addEventListener("keydown", (event) => {
      const currentIndex = Math.max(
        0,
        options.findIndex((option) => option.tabIndex === 0),
      );

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        trigger.focus();
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setActiveIndex(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        setActiveIndex(options.length - 1);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex(Math.min(options.length - 1, currentIndex + 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(Math.max(0, currentIndex - 1));
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        options[currentIndex].click();
      }
    });

    /** @param {HTMLButtonElement} option */
    const markSelected = (option) => {
      options.forEach((item) => {
        item.setAttribute("aria-selected", String(item === option));
      });
      trigger.textContent = `Period: ${option.textContent?.trim()}`;
    };

    // Show whatever period the store loads, including the default from settings
    document.addEventListener("data:loading", (event) => {
      const option = options.find(
        (item) => item.dataset.value === event.detail.period,
      );
      if (option) {
        markSelected(option);
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        markSelected(option);
        const period = /** @type {import("../types").Period | undefined} */ (
          option.dataset.value
        );
        close();
        trigger.focus();

        if (period) {
          document.dispatchEvent(
            new CustomEvent("period:change", { detail: { period } }),
          );
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(/** @type {Node | null} */ (event.target))) {
        close();
      }
    });
  });
}
