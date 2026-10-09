const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** @typedef {import("../types").Metrics} Metrics */
/** @typedef {import("../types").MetricKey} MetricKey */
/** @typedef {import("../types").Period} Period */

/**
 * Formats a percentage change with a direction arrow, e.g. "▲ 8.4%".
 * @param {number | undefined} value
 */
export const formatDelta = (value) => {
  if (typeof value !== "number") {
    return "—";
  }
  const absValue = Math.abs(value);
  const formatted =
    absValue % 1 === 0 ? absValue.toString() : absValue.toFixed(1);
  const arrow = value >= 0 ? "▲" : "▼";
  return `${arrow} ${formatted}%`;
};

export default function initMetrics() {
  const cards = /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll("[data-metric]"),
  ]);
  if (cards.length === 0) {
    return;
  }

  // Period of the last request, reloaded by the Retry button
  /** @type {{ period: Period }} */
  const state = { period: "month" };

  /**
   * @param {HTMLElement} card
   * @param {number} value
   * @param {Metrics} metrics
   */
  const updateCard = (card, value, metrics) => {
    const valueEl = card.querySelector("[data-metric-value]");
    const deltaEl = /** @type {HTMLElement | null} */ (
      card.querySelector("[data-metric-delta]")
    );
    const format = card.dataset.metricFormat ?? "currency";

    if (valueEl) {
      valueEl.textContent =
        format === "number"
          ? formatNumber.format(value)
          : formatCurrency.format(value);
    }
    if (deltaEl) {
      const key = /** @type {MetricKey} */ (card.dataset.metric);
      const deltaValue = metrics?.deltas?.[key];
      deltaEl.textContent = formatDelta(deltaValue);
      if (typeof deltaValue === "number") {
        deltaEl.dataset.deltaState = deltaValue < 0 ? "negative" : "positive";
      } else {
        deltaEl.removeAttribute("data-delta-state");
      }
    }
    card.dataset.state = "default";
  };

  /** @param {HTMLElement} card */
  const showError = (card) => {
    card.dataset.state = "error";
  };

  const setLoading = () => {
    cards.forEach((card) => {
      card.dataset.state = "loading";
    });
  };

  cards.forEach((card) => {
    const retryButton = card.querySelector(".c-metric__retry");
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        document.dispatchEvent(
          new CustomEvent("period:change", {
            detail: { period: state.period },
          }),
        );
      });
    }
  });

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
    cards.forEach((card) => {
      const key = /** @type {MetricKey} */ (card.dataset.metric);
      const value = data.metrics?.[key];
      if (typeof value === "number") {
        updateCard(card, value, data.metrics);
      }
    });
  });

  document.addEventListener("data:error", () => {
    cards.forEach(showError);
  });

  setLoading();
}
