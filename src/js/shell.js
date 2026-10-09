import initThemeToggle from "./modules/theme.js";
import initReveal from "./modules/reveal.js";
import initSidebar from "./modules/sidebar.js";

// Parts every page shares: theme toggle, scroll reveal, mobile sidebar
export default function initShell() {
  initThemeToggle();
  initReveal();
  initSidebar();
}
