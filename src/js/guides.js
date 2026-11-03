/* Guides : recherche par mots-clés + filtres (catégorie, type d'objet / logiciel). */
(() => {
  "use strict";

  const form = document.querySelector("[data-guide-filters]");
  const list = document.querySelector("[data-guide-list]");
  if (!form || !list) return;

  const input = form.querySelector("[data-guide-q]");
  const clearBtn = form.querySelector("[data-guide-clear-q]");
  const resetBtn = form.querySelector("[data-guide-reset]");
  const countEl = form.querySelector("[data-guide-count]");
  const catButtons = [...form.querySelectorAll("[data-guide-cats] [data-cat]")];
  const groups = [...form.querySelectorAll("[data-type-group]")];
  const chips = [...form.querySelectorAll("[data-type]")];
  const emptyEl = document.querySelector("[data-guide-empty]");

  const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const cards = [...list.querySelectorAll("[data-guide]")].map((el, position) => ({
    el,
    position,
    slug: el.dataset.slug,
    cat: el.dataset.cat,
    types: el.dataset.types ? el.dataset.types.split("|") : [],
    title: norm(el.dataset.title),
    summary: norm(el.dataset.summary),
    tags: norm(el.dataset.tags),
    body: "",
  }));

  /* ---------- État (synchronisé avec l'URL pour pouvoir partager une recherche) ---------- */
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get("q") ?? "",
    cat: params.get("cat") ?? "all",
    types: new Set(params.getAll("type")),
  };
  if (!catButtons.some((b) => b.dataset.cat === state.cat)) state.cat = "all";
  input.value = state.q;

  /* ---------- Index plein texte (chargé à la demande) ---------- */
  let indexRequested = false;
  function loadIndex() {
    if (indexRequested) return;
    indexRequested = true;
    fetch(form.dataset.index)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        cards.forEach((c) => (c.body = norm(data[c.slug] ?? "")));
        render();
      })
      .catch(() => {
        indexRequested = false;
      });
  }
  input.addEventListener("focus", loadIndex, { once: true });
  if (state.q) loadIndex();

  /* ---------- Rendu ---------- */
  function score(card, terms) {
    let total = 0;
    for (const t of terms) {
      let s = 0;
      if (card.title.includes(t)) s += 6;
      if (card.tags.includes(t)) s += 4;
      if (card.summary.includes(t)) s += 2;
      if (card.body.includes(t)) s += 1;
      if (!s) return 0; // tous les mots doivent être trouvés
      total += s;
    }
    return total;
  }

  function render() {
    const terms = norm(state.q).split(/\s+/).filter(Boolean);

    // Les types d'une autre catégorie que celle choisie disparaissent.
    groups.forEach((g) => (g.hidden = state.cat !== "all" && g.dataset.typeGroup !== state.cat));
    chips.forEach((chip) => {
      const group = chip.closest("[data-type-group]");
      if (group?.hidden) state.types.delete(chip.dataset.type);
      chip.setAttribute("aria-pressed", String(state.types.has(chip.dataset.type)));
    });
    catButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));

    const matches = [];
    const hidden = [];
    for (const card of cards) {
      const okCat = state.cat === "all" || card.cat === state.cat;
      const okType = state.types.size === 0 || card.types.some((t) => state.types.has(t));
      const s = terms.length ? score(card, terms) : 1;
      if (okCat && okType && s > 0) matches.push({ card, s });
      else hidden.push(card);
    }
    matches.sort((a, b) => b.s - a.s || a.card.position - b.card.position);

    // On réordonne le DOM (et pas seulement le CSS) pour garder un ordre de lecture cohérent.
    const frag = document.createDocumentFragment();
    matches.forEach(({ card }) => {
      card.el.hidden = false;
      frag.append(card.el);
    });
    hidden.sort((a, b) => a.position - b.position).forEach((card) => {
      card.el.hidden = true;
      frag.append(card.el);
    });
    list.append(frag);

    const n = matches.length;
    const active = Boolean(terms.length || state.cat !== "all" || state.types.size);
    countEl.textContent = active ? `${n} guide${n > 1 ? "s" : ""} trouvé${n > 1 ? "s" : ""} sur ${cards.length}` : `${n} guide${n > 1 ? "s" : ""}`;
    if (emptyEl) emptyEl.hidden = n > 0;
    list.hidden = n === 0;
    resetBtn.hidden = !active;
    clearBtn.hidden = !state.q;

    const url = new URL(location.href);
    url.search = "";
    if (state.q) url.searchParams.set("q", state.q);
    if (state.cat !== "all") url.searchParams.set("cat", state.cat);
    state.types.forEach((t) => url.searchParams.append("type", t));
    history.replaceState(null, "", url);
  }

  /* ---------- Événements ---------- */
  let timer;
  input.addEventListener("input", () => {
    state.q = input.value;
    clearBtn.hidden = !state.q;
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) {
      input.value = "";
      state.q = "";
      render();
    }
  });
  clearBtn.addEventListener("click", () => {
    input.value = "";
    state.q = "";
    render();
    input.focus();
  });
  catButtons.forEach((b) =>
    b.addEventListener("click", () => {
      state.cat = b.dataset.cat;
      render();
    }),
  );
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const t = chip.dataset.type;
      state.types.has(t) ? state.types.delete(t) : state.types.add(t);
      render();
    }),
  );
  resetBtn.addEventListener("click", () => {
    state.q = "";
    state.cat = "all";
    state.types.clear();
    input.value = "";
    render();
  });
  document.querySelectorAll("[data-guide-empty] a[href='/guides/']").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      resetBtn.click();
    }),
  );
  window.addEventListener("pageshow", (e) => e.persisted && render());

  render();
})();
