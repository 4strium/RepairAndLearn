import { icon } from "../../scripts/lib/icons.mjs";
import { html } from "../../scripts/lib/utils.mjs";
import { layout } from "./layout.mjs";
import { guideCard, pageHero } from "./components.mjs";

export function guidesPage(ctx) {
  const { config, guides, dims } = ctx;
  const cats = Object.entries(config.categories);

  // Types réellement utilisés (inutile d'afficher des filtres qui ne donnent rien).
  const counts = new Map();
  for (const g of guides) for (const t of g.types) counts.set(t, (counts.get(t) ?? 0) + 1);

  const body = html`
  ${pageHero({
    eyebrow: "Base de connaissances",
    title: "Guides & tutoriels",
    intro: "« Comment réparer… », « Comment installer… » : des guides pas à pas écrits par les membres de l'association. Cherche par mot-clé ou filtre par type d'objet ou de logiciel.",
  })}

  <section class="section section--flush-top">
    <div class="container">
      <form class="filters reveal" role="search" data-guide-filters data-index="/guides/search-index.json" onsubmit="return false">
        <div class="search-field">
          ${icon("search")}
          <label class="visually-hidden" for="guide-q">Rechercher un guide</label>
          <input id="guide-q" type="search" name="q" placeholder="Rechercher : « chambre à air », « Linux », « soudure »…" autocomplete="off" spellcheck="false" data-guide-q>
          <button type="button" class="search-field__clear" data-guide-clear-q aria-label="Effacer la recherche" hidden>${icon("x")}</button>
        </div>

        <div class="filters__row">
          <div class="segmented" role="group" aria-label="Catégorie" data-guide-cats>
            <button type="button" class="segmented__btn" data-cat="all" aria-pressed="true">Tous</button>
            ${cats.map(
              ([key, c]) => html`<button type="button" class="segmented__btn" data-cat="${key}" aria-pressed="false">${icon(c.icon)} ${c.label}</button>`,
            )}
          </div>
        </div>

        ${cats.map(([key, c]) => {
          const types = c.types.filter((t) => counts.has(t));
          if (!types.length) return "";
          return html`<fieldset class="filters__group" data-type-group="${key}">
            <legend>${c.typesLabel}</legend>
            <div class="chips">
              ${types.map(
                (t) => html`<button type="button" class="chip" data-type="${t}" aria-pressed="false">${t} <span class="chip__count">${counts.get(t)}</span></button>`,
              )}
            </div>
          </fieldset>`;
        })}

        <div class="filters__foot">
          <p class="toolbar__count" aria-live="polite" data-guide-count>${guides.length} guide${guides.length > 1 ? "s" : ""}</p>
          <button type="button" class="link-btn" data-guide-reset hidden>${icon("rotate-ccw")} Réinitialiser les filtres</button>
        </div>
      </form>

      ${guides.length ? html`<ul class="card-grid" data-guide-list>${guides.map((g) => guideCard(g, { dims }))}</ul>` : ""}

      <div class="empty-state" data-guide-empty ${guides.length ? "hidden" : ""}>
        ${icon("search")}
        <p><strong>${guides.length ? "Aucun guide ne correspond à ta recherche." : "Les premiers guides arrivent bientôt."}</strong></p>
        <p>Essaie d'autres mots-clés, ou <a href="/contact/?sujet=guide">propose-nous le guide que tu aimerais voir</a>.</p>
      </div>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container">
      <div class="contribute reveal">
        <span class="contribute__icon">${icon("pencil-line")}</span>
        <div>
          <h2>Tu fais partie de l'asso&nbsp;? Ajoute ton guide.</h2>
          <p>Un formulaire en ligne suffit : titre, étapes, photos — pas besoin de savoir coder. Ton guide est relu avant d'être publié.</p>
        </div>
        <div class="contribute__actions">
          <a class="btn btn--primary" href="/admin/">${icon("pencil-line")} Écrire un guide</a>
          <a class="btn btn--ghost" href="/contact/?sujet=guide">${icon("lightbulb")} Suggérer un sujet</a>
        </div>
      </div>
    </div>
  </section>`;

  return layout(ctx, {
    path: "/guides/",
    title: "Guides & tutoriels",
    description:
      "Guides pas à pas pour réparer des objets du quotidien et installer des outils open source. Recherche par mot-clé, type d'objet ou logiciel.",
    body,
    scripts: ["guides"],
  });
}

/** Index plein texte (chargé à la demande par la page Guides). */
export function guidesSearchIndex(guides) {
  return Object.fromEntries(guides.map((g) => [g.slug, g.searchText]));
}
