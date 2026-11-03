import { icon } from "../../scripts/lib/icons.mjs";
import { html, raw } from "../../scripts/lib/utils.mjs";
import { formatGuideDate } from "../../scripts/lib/dates.mjs";
import { layout } from "./layout.mjs";
import { difficultyMeter, guideCard, media, sticker } from "./components.mjs";

export function guidePage(ctx, g) {
  const { config, guides, dims } = ctx;
  const cat = config.categories[g.category];

  const related = guides
    .filter((o) => o.slug !== g.slug)
    .map((o) => ({ o, score: (o.category === g.category ? 1 : 0) + o.types.filter((t) => g.types.includes(t)).length * 2 }))
    .sort((a, b) => b.score - a.score || b.o.date - a.o.date)
    .slice(0, 3)
    .filter((r) => r.score > 0 || guides.length <= 4)
    .map((r) => r.o);

  const numbered = g.steps.filter((s) => s.kind === "step");
  const giscus = config.giscus;
  const giscusReady = giscus.repo && giscus.repoId && giscus.categoryId;

  const body = html`
  <article class="guide">
    <header class="guide-hero">
      <div class="container container--narrow">
        <nav class="breadcrumb" aria-label="Fil d'Ariane">
          <a href="/guides/">${icon("chevron-left")} Tous les guides</a>
        </nav>
        <p class="guide-hero__cat">${sticker(cat.label, { iconName: cat.icon })}
          ${g.types.map((t) => html`<a class="chip chip--link" href="/guides/?cat=${g.category}&type=${encodeURIComponent(t)}">${t}</a>`)}
        </p>
        <h1 class="guide-hero__title">${g.title}</h1>
        <p class="guide-hero__summary">${g.summary}</p>
        <ul class="meta-list">
          <li>${icon("user-round")}<span><small>Auteur</small>${g.author}</span></li>
          <li>${icon("calendar-days")}<span><small>Publié le</small><time datetime="${g.dateIso}">${formatGuideDate(g.date)}</time></span></li>
          ${g.difficulty ? html`<li>${icon("gauge")}<span><small>Difficulté</small>${difficultyMeter(g.difficulty)}</span></li>` : ""}
          ${g.duration ? html`<li>${icon("timer")}<span><small>Durée</small>${g.duration}</span></li>` : ""}
        </ul>
      </div>
    </header>

    ${g.cover
      ? html`<div class="container container--narrow"><figure class="guide-cover">${media({ src: g.cover, alt: g.coverAlt, kind: g.category, priority: true, dims })}</figure></div>`
      : ""}

    <div class="container guide-layout">
      <aside class="guide-toc" aria-label="Sommaire">
        <details class="toc" open data-toc>
          <summary>${icon("list")} Sommaire</summary>
          <ol>
            ${g.materials.length ? html`<li><a href="#materiel">Matériel</a></li>` : ""}
            ${g.steps.map(
              (s) => html`<li><a href="#${s.id}" data-toc-link>${s.kind === "step" ? html`<span class="toc__num">${s.number}</span>` : ""}${s.title}</a></li>`,
            )}
            <li><a href="#commentaires" data-toc-link>${icon("message-circle")} Commentaires</a></li>
          </ol>
        </details>
      </aside>

      <div class="guide-body">
        ${g.introHtml ? html`<div class="prose prose--lead">${raw(g.introHtml)}</div>` : ""}

        ${g.materials.length
          ? html`<section class="materials" id="materiel" aria-labelledby="materiel-title">
              <h2 id="materiel-title">${icon("package")} Matériel &amp; prérequis</h2>
              <ul class="checklist">
                ${g.materials.map(
                  (m, i) => html`<li><label><input type="checkbox" id="mat-${i}"><span>${m}</span></label></li>`,
                )}
              </ul>
            </section>`
          : ""}

        <div class="steps">
          ${g.steps.map((s) =>
            s.kind === "step"
              ? html`<section class="step" id="${s.id}" aria-labelledby="${s.id}-title">
                  <header class="step__head">
                    <span class="step__num" aria-hidden="true">${s.number}</span>
                    <h2 id="${s.id}-title"><span class="visually-hidden">Étape ${s.number} : </span>${s.title}</h2>
                  </header>
                  <div class="prose">${raw(s.html)}</div>
                </section>`
              : html`<section class="step step--extra" id="${s.id}" aria-labelledby="${s.id}-title">
                  <header class="step__head"><span class="step__num step__num--icon" aria-hidden="true">${icon("sparkles")}</span><h2 id="${s.id}-title">${s.title}</h2></header>
                  <div class="prose">${raw(s.html)}</div>
                </section>`,
          )}
        </div>

        <div class="guide-end">
          <p>${numbered.length ? "Terminé !" : "Merci de ta lecture !"} Ce guide t'a servi ? Dis-le-nous en commentaire, ou viens nous voir en repair café.</p>
          <div class="guide-end__actions">
            <button type="button" class="btn btn--ghost btn--sm" data-copy-link>${icon("link")} <span>Copier le lien</span></button>
            <button type="button" class="btn btn--ghost btn--sm" data-print>${icon("printer")} Imprimer</button>
          </div>
        </div>

        <section class="comments" id="commentaires" aria-labelledby="comments-title">
          <h2 id="comments-title">${icon("message-circle")} Commentaires</h2>
          ${giscusReady
            ? html`<p class="muted comments__hint">Les commentaires passent par GitHub (Discussions). Un compte GitHub gratuit est nécessaire pour écrire.</p>
                <div data-giscus
                  data-repo="${giscus.repo}" data-repo-id="${giscus.repoId}"
                  data-category="${giscus.category}" data-category-id="${giscus.categoryId}"></div>`
            : html`<div class="comments__fallback">
                <p><strong>Les commentaires ouvriront bientôt.</strong></p>
                <p>En attendant, une question, une correction ou une photo de ta réparation&nbsp;? <a href="/contact/?sujet=guide">Écris-nous</a> !</p>
              </div>`}
        </section>
      </div>
    </div>

    ${related.length
      ? html`<section class="section section--tint">
          <div class="container">
            <h2 class="section-title">Ça peut aussi t'intéresser</h2>
            <ul class="card-grid">${related.map((r) => guideCard(r, { dims }))}</ul>
          </div>
        </section>`
      : ""}
  </article>`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.title,
      description: g.summary,
      datePublished: g.dateIso,
      author: { "@type": "Person", name: g.author },
      publisher: { "@type": "Organization", name: config.name },
      image: g.cover ? [new URL(g.cover, ctx.siteUrl).href] : undefined,
      mainEntityOfPage: new URL(`/guides/${g.slug}/`, ctx.siteUrl).href,
    },
  ];

  return layout(ctx, {
    path: `/guides/${g.slug}/`,
    title: g.title,
    description: g.summary,
    ogImage: g.cover && !g.cover.endsWith(".svg") ? g.cover : undefined,
    body,
    scripts: ["guide"],
    jsonld,
    bodyClass: "page-guide",
  });
}
