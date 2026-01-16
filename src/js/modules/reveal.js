const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function initReveal() {
  const items = [...document.querySelectorAll(".u-reveal")];
  if (items.length === 0) {
    return;
  }

  if (prefersReducedMotion()) {
    items.forEach((item) => item.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "80px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}
