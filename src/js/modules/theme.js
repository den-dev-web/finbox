const THEME_KEY = "finbox-theme";

/** @typedef {"light" | "dark"} Theme */

// Storage access throws in some private modes; the theme then follows the OS
const readStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

/** @param {Theme} theme */
const storeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // The choice still applies for this visit, it is just not remembered
  }
};

/** @returns {Theme} */
const getPreferredTheme = () => {
  const stored = readStoredTheme();
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/** @param {Theme} theme */
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export default function initThemeToggle() {
  const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
  if (!buttons.length) {
    return;
  }

  /** @param {Theme} theme */
  const updateLabel = (theme) => {
    const label = theme === "dark" ? "Theme: Dark" : "Theme: Light";
    buttons.forEach((button) => {
      button.textContent = label;
    });
  };

  let currentTheme = getPreferredTheme();
  applyTheme(currentTheme);
  updateLabel(currentTheme);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(currentTheme);
      storeTheme(currentTheme);
      updateLabel(currentTheme);
    });
  });
}
