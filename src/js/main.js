/* Repair n' Learn — comportements communs à toutes les pages (sans dépendance). */
(() => {
  "use strict";

  /* ---------- En-tête : ombre au défilement ---------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.toggleAttribute("data-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => e.target.closest("a") && setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.hasAttribute("data-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (nav.hasAttribute("data-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 860px)").addEventListener("change", (m) => m.matches && setOpen(false));
  }

  /* ---------- Apparition au défilement ---------- */
  const items = [...document.querySelectorAll(".reveal")];
  if (items.length) {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-visible"));
    } else {
      // Décalage progressif entre éléments frères (cartes d'une grille).
      const byParent = new Map();
      items.forEach((el) => {
        const list = byParent.get(el.parentElement) ?? [];
        list.push(el);
        byParent.set(el.parentElement, list);
      });
      byParent.forEach((list) => {
        if (list.length > 1) list.forEach((el, i) => el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 70}ms`));
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      items.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Boutons « copier » ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("span");
    const original = label?.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (label) label.textContent = "Adresse copiée !";
      } catch {
        if (label) label.textContent = btn.dataset.copy;
      }
      setTimeout(() => label && (label.textContent = original), 2200);
    });
  });
})();
