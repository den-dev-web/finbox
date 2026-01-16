import { getDashboard } from "../data/api.js";

const state = {
  period: "month",
  status: "idle",
};

const notifyLoaded = (period, data) => {
  document.dispatchEvent(
    new CustomEvent("data:loaded", { detail: { period, data } })
  );
};

const notifyError = (period, error) => {
  document.dispatchEvent(
    new CustomEvent("data:error", { detail: { period, error } })
  );
};

const load = async () => {
  state.status = "loading";
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
  document.addEventListener("period:change", (event) => {
    if (event.detail?.period) {
      state.period = event.detail.period;
      load();
    }
  });

  load();
}
