const THEME_KEY = "finbox-theme";

const getPreferredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

export default function initThemeToggle() {
  const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
  if (!buttons.length) {
    return;
  }

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
      localStorage.setItem(THEME_KEY, currentTheme);
      updateLabel(currentTheme);
    });
  });
}
