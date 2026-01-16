export default function initSidebar() {
  const sidebar = document.querySelector("[data-sidebar]");
  const toggle = document.querySelector("[data-sidebar-toggle]");
  const overlay = document.querySelector("[data-sidebar-overlay]");

  if (!sidebar || !toggle || !overlay) {
    return;
  }

  const setOpen = (isOpen) => {
    sidebar.classList.toggle("is-open", isOpen);
    overlay.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("is-scroll-locked", isOpen);
  };

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.contains("is-open");
    if (isOpen) {
      close();
    } else {
      open();
    }
  });

  overlay.addEventListener("click", () => {
    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (!sidebar.contains(target) && !toggle.contains(target)) {
      close();
    }
  });
}
