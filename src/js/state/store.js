import { getDashboard } from "../data/api.js";
import { getSettings } from "./settings.js";

/** @typedef {import("../types").Period} Period */
/** @typedef {import("../types").DashboardData} DashboardData */

/** @type {{ period: Period, status: "idle" | "loading" | "success" | "error" }} */
const state = {
  period: "month",
  status: "idle",
};

/**
 * @param {Period} period
 * @param {DashboardData} data
 */
const notifyLoaded = (period, data) => {
  document.dispatchEvent(
    new CustomEvent("data:loaded", { detail: { period, data } }),
  );
};

/**
 * @param {Period} period
 * @param {unknown} error
 */
const notifyError = (period, error) => {
  document.dispatchEvent(
    new CustomEvent("data:error", { detail: { period, error } }),
  );
};

/** @param {Period} period */
const notifyLoading = (period) => {
  document.dispatchEvent(
    new CustomEvent("data:loading", { detail: { period } }),
  );
};

const load = async () => {
  state.status = "loading";
  notifyLoading(state.period);
  try {
    const data = await getDashboard(state.period);
    state.status = "success";
    notifyLoaded(state.period, data);
  } catch (error) {
    state.status = "error";
    notifyError(state.period, error);
  }
};

export default function initStore() {
  state.period = getSettings().defaultPeriod;
  document.addEventListener("period:change", (event) => {
    if (event.detail?.period) {
      state.period = event.detail.period;
      load();
    }
  });

  // Retry always reloads the store's own period, the single source of truth
  document.addEventListener("data:retry", load);

  load();
}
