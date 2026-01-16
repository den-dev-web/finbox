const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const formatDelta = (value) => {
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
  const cards = [...document.querySelectorAll("[data-metric]")];
  if (cards.length === 0) {
    return;
  }

  const state = { period: "month" };

  const updateCard = (card, value, periodLabel, metrics) => {
    const valueEl = card.querySelector("[data-metric-value]");
    const deltaEl = card.querySelector("[data-metric-delta]");
    const format = card.dataset.metricFormat ?? "currency";

    if (valueEl) {
      valueEl.textContent =
        format === "number"
          ? formatNumber.format(value)
          : formatCurrency.format(value);
    }
    if (deltaEl) {
      const deltaValue = metrics?.deltas?.[card.dataset.metric];
      deltaEl.textContent = formatDelta(deltaValue);
      if (typeof deltaValue === "number") {
        deltaEl.dataset.deltaState = deltaValue < 0 ? "negative" : "positive";
      } else {
        deltaEl.removeAttribute("data-delta-state");
      }
    }
    card.dataset.state = "default";
  };

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
          new CustomEvent("period:change", { detail: { period: state.period } })
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
    const period = event.detail?.period ?? state.period;
    if (!data) {
      return;
    }
    cards.forEach((card) => {
      const key = card.dataset.metric;
      const value = data.metrics?.[key];
      if (typeof value === "number") {
        updateCard(card, value, null, data.metrics);
      }
    });
  });

  document.addEventListener("data:error", () => {
    cards.forEach(showError);
  });

  setLoading();
}
