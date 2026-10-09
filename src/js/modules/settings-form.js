import {
  DEFAULT_SETTINGS,
  SETTING_OPTIONS,
  getSettings,
  saveSettings,
} from "../state/settings.js";
import { RATES } from "../utils/format.js";

/** @typedef {import("../state/settings.js").Settings} Settings */

const SAVED = "Saved. Other pages use the new settings when you open them.";
const RESTORED = "Defaults restored.";
const BLOCKED =
  "Your browser blocks storage, so settings apply to this page only.";

/** @type {(keyof Settings)[]} */
const KEYS = ["theme", "density", "currency", "defaultPeriod"];

export default function initSettingsForm() {
  const form = /** @type {HTMLFormElement | null} */ (
    document.querySelector("[data-settings-form]")
  );
  const status = document.querySelector("[data-settings-status]");
  if (!form) {
    return;
  }

  // Rates come from the code that converts amounts, so the hint cannot drift
  const rates = form.querySelector("[data-settings-rates]");
  if (rates) {
    rates.textContent = `Amounts convert with fixed demo rates: 1 USD = ${RATES.EUR} EUR = ${RATES.UAH} UAH.`;
  }

  /** @param {Settings} settings */
  const fill = (settings) => {
    KEYS.forEach((key) => {
      const field = /** @type {RadioNodeList | HTMLSelectElement} */ (
        form.elements.namedItem(key)
      );
      field.value = settings[key];
    });
  };

  /** @returns {Settings} */
  const read = () =>
    /** @type {Settings} */ (
      Object.fromEntries(
        KEYS.map((key) => {
          const value = new FormData(form).get(key);
          const allowed = /** @type {unknown[]} */ (SETTING_OPTIONS[key]);
          return [key, allowed.includes(value) ? value : DEFAULT_SETTINGS[key]];
        }),
      )
    );

  /** @param {string} message */
  const announce = (message) => {
    if (!status) {
      return;
    }
    // Clearing first makes screen readers repeat an identical message
    status.textContent = "";
    requestAnimationFrame(() => {
      status.textContent = message;
    });
  };

  /**
   * @param {Settings} settings
   * @param {string} message
   */
  const apply = (settings, message) => {
    const saved = saveSettings(settings);
    document.dispatchEvent(new CustomEvent("settings:change"));
    announce(saved ? message : BLOCKED);
  };

  fill(getSettings());

  form.addEventListener("change", () => apply(read(), SAVED));
  // Enter in a field must not reload the page
  form.addEventListener("submit", (event) => event.preventDefault());

  form.querySelector("[data-settings-reset]")?.addEventListener("click", () => {
    fill(DEFAULT_SETTINGS);
    apply(DEFAULT_SETTINGS, RESTORED);
  });
}
