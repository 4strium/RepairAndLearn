/* Rendez-vous : masquage des dates passées, filtres, fenêtre modale. */
(() => {
  "use strict";

  const now = Date.now();
  const dialog = document.querySelector("[data-event-dialog]");

  /* ---------- 1. Masquer les rendez-vous terminés depuis le dernier déploiement ---------- */
  document.querySelectorAll("[data-event-item]").forEach((el) => {
    if (Date.parse(el.dataset.end) < now) {
      el.dataset.expired = "";
      el.hidden = true;
    }
  });

  /* ---------- 2. Filtre par type + limite + état vide ---------- */
  const lists = [...document.querySelectorAll("[data-event-list]")];
  const filterBar = document.querySelector("[data-event-filters]");
  const countEl = document.querySelector("[data-event-count]");
  const emptyEl = document.querySelector("[data-empty]");
  let filter = new URLSearchParams(location.search).get("type") || "all";

  function applyFilters() {
    let shown = 0;
    lists.forEach((list) => {
      const limit = Number(list.dataset.limit) || Infinity;
      let n = 0;
      list.querySelectorAll("[data-event-item]").forEach((el) => {
        const ok = !("expired" in el.dataset) && (filter === "all" || el.dataset.type === filter) && n < limit;
        el.hidden = !ok;
        if (ok) n++;
      });
      shown += n;
    });
    if (emptyEl) emptyEl.hidden = shown > 0;
    if (countEl) countEl.textContent = shown ? `${shown} rendez-vous à venir` : "";
    filterBar?.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
  }

  if (filterBar) {
    if (!filterBar.querySelector(`[data-filter="${filter}"]`)) filter = "all";
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filter = btn.dataset.filter;
      const url = new URL(location.href);
      filter === "all" ? url.searchParams.delete("type") : url.searchParams.set("type", filter);
      history.replaceState(null, "", url);
      applyFilters();
    });
  }
  applyFilters();

  /* ---------- 3. Fenêtre modale ---------- */
  if (!dialog) return;
  const panel = dialog.querySelector(".modal__panel");
  const body = dialog.querySelector("[data-modal-body]");
  let currentSlug = null;

  function open(slug, { updateHash = true } = {}) {
    const tpl = document.getElementById(`event-tpl-${slug}`);
    if (!tpl) return;
    body.replaceChildren(tpl.content.cloneNode(true));
    currentSlug = slug;
    if (!dialog.open) dialog.showModal();
    panel.scrollTop = 0;
    if (updateHash) history.replaceState(null, "", `#${slug}`);
  }

  function close() {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      dialog.classList.remove("is-closing");
      dialog.close();
    };
    panel.addEventListener("animationend", finish, { once: true });
    setTimeout(finish, 350); // filet de sécurité
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-event-open]");
    if (trigger) open(trigger.dataset.eventOpen);
  });
  dialog.querySelector("[data-modal-close]").addEventListener("click", close);

  // Clic sur le fond flouté (et non sur le panneau) : fermeture.
  let pressedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (e) => (pressedOnBackdrop = e.target === dialog));
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog && pressedOnBackdrop) close();
  });
  // Touche Échap : on passe par notre fermeture animée.
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener("close", () => {
    body.replaceChildren();
    if (location.hash.slice(1) === currentSlug) history.replaceState(null, "", location.pathname + location.search);
    currentSlug = null;
  });

  // Lien direct : /rendez-vous/#slug ouvre la fenêtre du rendez-vous.
  function openFromHash() {
    const slug = decodeURIComponent(location.hash.slice(1));
    if (slug && slug !== currentSlug && document.getElementById(`event-tpl-${slug}`)) open(slug, { updateHash: false });
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
