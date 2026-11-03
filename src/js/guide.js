/* Page d'un guide : sommaire actif, actions, commentaires (Giscus chargé à la demande). */
(() => {
  "use strict";

  /* ---------- Sommaire : replié sur mobile, section active au défilement ---------- */
  const toc = document.querySelector("[data-toc]");
  if (toc && window.matchMedia("(max-width: 999px)").matches) toc.removeAttribute("open");

  const links = [...document.querySelectorAll("[data-toc-link]")];
  const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
  if (links.length && targets.length) {
    let ticking = false;
    const update = () => {
      ticking = false;
      let current = targets[0];
      for (const t of targets) if (t.getBoundingClientRect().top <= 140) current = t;
      links.forEach((a) => {
        const on = a.getAttribute("href") === `#${current.id}`;
        a.classList.toggle("is-active", on);
        on ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current");
      });
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  /* ---------- Actions ---------- */
  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
  const copyBtn = document.querySelector("[data-copy-link]");
  if (copyBtn) {
    const label = copyBtn.querySelector("span");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href.split("#")[0]);
        label.textContent = "Lien copié !";
      } catch {
        window.prompt("Copie ce lien :", location.href.split("#")[0]);
      }
      setTimeout(() => (label.textContent = "Copier le lien"), 2200);
    });
  }

  /* ---------- Commentaires (Giscus) : chargés seulement quand on s'en approche ---------- */
  const host = document.querySelector("[data-giscus]");
  if (host && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const s = document.createElement("script");
        s.src = "https://giscus.app/client.js";
        s.async = true;
        s.crossOrigin = "anonymous";
        const attrs = {
          "data-repo": host.dataset.repo,
          "data-repo-id": host.dataset.repoId,
          "data-category": host.dataset.category,
          "data-category-id": host.dataset.categoryId,
          "data-mapping": "pathname",
          "data-strict": "0",
          "data-reactions-enabled": "1",
          "data-emit-metadata": "0",
          "data-input-position": "top",
          "data-theme": "light",
          "data-lang": "fr",
          "data-loading": "lazy",
        };
        Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
        host.append(s);
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(host);
  }
})();
