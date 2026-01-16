const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-danger)",
  "#f5b941",
  "#7a6ff0",
];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const createSvgElement = (name) =>
  document.createElementNS("http://www.w3.org/2000/svg", name);

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const animateStroke = (element, from, to) => {
  if (prefersReducedMotion()) {
    element.style.strokeDashoffset = to;
    return;
  }
  element.style.strokeDashoffset = from;
  requestAnimationFrame(() => {
    element.style.strokeDashoffset = to;
  });
};

const buildLineChart = (svg, labels, values, variant) => {
  const width = 320;
  const height = 220;
  const padding = 18;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const stepX = (width - padding * 2) / Math.max(values.length - 1, 1);

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";

  for (let i = 1; i <= 3; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    const grid = createSvgElement("line");
    grid.setAttribute("x1", padding.toString());
    grid.setAttribute("x2", (width - padding).toString());
    grid.setAttribute("y1", y.toString());
    grid.setAttribute("y2", y.toString());
    grid.setAttribute("class", "c-chart__grid");
    svg.appendChild(grid);
  }

  const points = values.map((value, index) => {
    const x = padding + stepX * index;
    const normalized = (value - minValue) / range;
    const y = height - padding - normalized * (height - padding * 2);
    return { x, y };
  });

  const path = createSvgElement("path");
  const d = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  path.setAttribute("d", d);
  path.setAttribute("class", variant === "expense" ? "c-chart__line c-chart__line--expense" : "c-chart__line");
  svg.appendChild(path);

  const length = path.getTotalLength();
  path.style.strokeDasharray = `${length}`;
  animateStroke(path, `${length}`, "0");

  points.forEach((point) => {
    const dot = createSvgElement("circle");
    dot.setAttribute("cx", point.x.toString());
    dot.setAttribute("cy", point.y.toString());
    dot.setAttribute("r", "3.5");
    dot.setAttribute(
      "class",
      variant === "expense" ? "c-chart__dot c-chart__dot--expense" : "c-chart__dot"
    );
    svg.appendChild(dot);
  });

  return labels;
};

const computeLineStats = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  const avg = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const change =
    first === 0 ? null : ((last - first) / Math.abs(first)) * 100;

  return {
    avg,
    min,
    max,
    change,
  };
};

const renderStats = (container, stats) => {
  if (!container || !stats) {
    return;
  }
  const changeText =
    stats.change === null
      ? "—"
      : `${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(1)}%`;

  container.innerHTML = `
    <div class="c-chart__stat">
      <span class="c-chart__stat-label">Avg</span>
      <span class="c-chart__stat-value">${formatCurrency.format(stats.avg)}</span>
    </div>
    <div class="c-chart__stat">
      <span class="c-chart__stat-label">Peak</span>
      <span class="c-chart__stat-value">${formatCurrency.format(stats.max)}</span>
    </div>
    <div class="c-chart__stat">
      <span class="c-chart__stat-label">Low</span>
      <span class="c-chart__stat-value">${formatCurrency.format(stats.min)}</span>
    </div>
    <div class="c-chart__stat">
      <span class="c-chart__stat-label">Change</span>
      <span class="c-chart__stat-value">${changeText}</span>
    </div>
  `;
};

const buildDoughnutChart = (svg, labels, values) => {
  const size = 220;
  const radius = 78;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = values.reduce((sum, value) => sum + value, 0) || 1;

  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.innerHTML = "";

  let offset = 0;
  values.forEach((value, index) => {
    const slice = createSvgElement("circle");
    const length = (value / total) * circumference;
    slice.setAttribute("cx", center.toString());
    slice.setAttribute("cy", center.toString());
    slice.setAttribute("r", radius.toString());
    slice.setAttribute("fill", "transparent");
    slice.setAttribute("stroke", CHART_COLORS[index % CHART_COLORS.length]);
    slice.setAttribute("stroke-width", "18");
    slice.setAttribute("stroke-dasharray", `${length} ${circumference - length}`);
    slice.setAttribute("stroke-dashoffset", (-offset).toString());
    slice.setAttribute("stroke-linecap", "round");
    slice.setAttribute("class", "c-chart__slice");
    svg.appendChild(slice);
    animateStroke(slice, `${-offset - length}`, `${-offset}`);
    offset += length;
  });

  const hole = createSvgElement("circle");
  hole.setAttribute("cx", center.toString());
  hole.setAttribute("cy", center.toString());
  hole.setAttribute("r", "56");
  hole.setAttribute("fill", "var(--color-card)");
  svg.appendChild(hole);

  return labels.map((label, index) => ({
    label,
    value: values[index],
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
};

const renderLabels = (container, labels) => {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  container.style.setProperty("--chart-label-count", labels.length);
  labels.forEach((label) => {
    const item = document.createElement("div");
    item.textContent = label;
    container.appendChild(item);
  });
};

const renderLegend = (container, items) => {
  if (!container) {
    return;
  }
  container.innerHTML = "";
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "c-chart__legend-item";

    const label = document.createElement("span");
    label.textContent = item.label;

    const swatch = document.createElement("span");
    swatch.className = "c-chart__legend-swatch";
    swatch.style.background = item.color;

    const value = document.createElement("span");
    value.textContent = `${item.value}%`;

    row.appendChild(swatch);
    row.appendChild(label);
    row.appendChild(value);
    container.appendChild(row);
  });
};

export default function initCharts() {
  const chartCards = [...document.querySelectorAll("[data-chart-card]")];
  if (chartCards.length === 0) {
    return;
  }

  const state = {
    data: null,
  };

  const setLoading = () => {
    chartCards.forEach((card) => {
      card.dataset.state = "loading";
    });
  };

  const renderChartCard = (card, data) => {
  const chart = card.querySelector("[data-chart]");
  const svg = card.querySelector(".c-chart__svg");
  const labelsContainer = card.querySelector("[data-chart-labels]");
  const legendContainer = card.querySelector("[data-chart-legend]");
  const statsContainer = card.querySelector("[data-chart-stats]");

    if (!chart || !svg) {
      return;
    }

    const seriesKey = chart.dataset.series;
    const chartType = chart.dataset.chart;
    const series = data.charts?.[seriesKey];

    if (!series || !Array.isArray(series.values)) {
      return;
    }

    if (chartType === "line") {
      const labels = buildLineChart(
        svg,
        series.labels || [],
        series.values,
        seriesKey
      );
      renderLabels(labelsContainer, labels);
      renderStats(statsContainer, computeLineStats(series.values));
    } else if (chartType === "doughnut") {
      const legendItems = buildDoughnutChart(
        svg,
        series.labels || [],
        series.values
      );
      renderLegend(legendContainer, legendItems);
    }

    card.dataset.state = "default";
  };

  document.addEventListener("period:change", (event) => {
    if (event.detail?.period) {
      setLoading();
    }
  });

  document.addEventListener("data:loaded", (event) => {
    const data = event.detail?.data;
    if (!data) {
      return;
    }
    state.data = data;
    chartCards.forEach((card) => {
      if (card.dataset.visible === "true") {
        renderChartCard(card, data);
      }
    });
  });

  document.addEventListener("data:error", () => {
    chartCards.forEach((card) => {
      if (card.dataset.visible === "true") {
        card.dataset.state = "error";
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const card = entry.target;
        card.dataset.visible = "true";
        observer.unobserve(card);
        if (state.data) {
          renderChartCard(card, state.data);
        }
      });
    },
    { rootMargin: "120px 0px" }
  );

  chartCards.forEach((card) => {
    observer.observe(card);
  });

  setLoading();
}
