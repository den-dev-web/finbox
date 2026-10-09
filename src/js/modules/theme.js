import { getSettings, saveSettings } from "../state/settings.js";

/** @typedef {"light" | "dark"} Theme */

const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

/** @returns {Theme} */
const resolveTheme = () => {
  const { theme } = getSettings();
  if (theme === "system") {
    return darkScheme.matches ? "dark" : "light";
  }
  return theme;
};

/** @param {Theme} theme */
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export default function initThemeToggle() {
  const buttons = [...document.querySelectorAll("[data-theme-toggle]")];

  /** @param {Theme} theme */
  const updateLabel = (theme) => {
    const label = theme === "dark" ? "Theme: Dark" : "Theme: Light";
    buttons.forEach((button) => {
      button.textContent = label;
    });
  };

  // Kept in memory so toggling works even when storage is blocked
  let current = resolveTheme();

  /** @param {Theme} theme */
  const show = (theme) => {
    current = theme;
    applyTheme(theme);
    updateLabel(theme);
  };

  const refresh = () => show(resolveTheme());

  refresh();

  // "System" follows the OS live, e.g. automatic dark mode at sunset
  darkScheme.addEventListener("change", () => {
    if (getSettings().theme === "system") {
      refresh();
    }
  });

  // The Settings page announces saved changes
  document.addEventListener("settings:change", refresh);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = current === "dark" ? "light" : "dark";
      // Without storage the choice still applies for this visit
      saveSettings({ theme: next });
      show(next);
    });
  });
}
