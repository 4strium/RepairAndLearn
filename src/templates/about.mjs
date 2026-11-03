import { icon } from "../../scripts/lib/icons.mjs";
import { html, raw } from "../../scripts/lib/utils.mjs";
import { layout } from "./layout.mjs";
import { pageHero, sectionHead } from "./components.mjs";

/** Page « À propos » : tout le contenu éditable est dans content/about.md. */
export function aboutPage(ctx) {
  const { config } = ctx;
  const a = ctx.about;
  const timeline = a.timeline ?? [];
  const values = a.values ?? [];

  const body = html`
  ${pageHero({ eyebrow: a.eyebrow ?? "Notre histoire", title: a.title ?? "À propos", intro: a.intro })}

  <section class="section section--flush-top">
    <div class="container about-grid">
      <div class="about-story prose prose--lead reveal">${raw(a.html)}</div>
      <figure class="about-badge reveal">
        <img src="/img/brand/logo-icon-512.webp" width="512" height="512" alt="Logo Repair n' Learn : R&amp;L sur une plaque de cuivre vissée" loading="lazy">
      </figure>
    </div>
  </section>

  ${timeline.length
    ? html`<section class="section section--tint" aria-labelledby="parcours">
        <div class="container container--narrow">
          ${sectionHead({ eyebrow: "Le fil du projet", title: "De l'idée à aujourd'hui" })}
          <ol class="timeline">
            ${timeline.map(
              (t, i) => html`<li class="timeline__item reveal">
                <span class="timeline__dot" aria-hidden="true">${i + 1}</span>
                <div>
                  ${t.label ? html`<p class="timeline__label">${t.label}</p>` : ""}
                  <h3>${t.title}</h3>
                  <p>${t.text}</p>
                </div>
              </li>`,
            )}
          </ol>
        </div>
      </section>`
    : ""}

  ${values.length
    ? html`<section class="section" aria-labelledby="valeurs">
        <div class="container">
          ${sectionHead({ eyebrow: "Ce qui nous guide", title: "Nos valeurs" })}
          <ul class="value-cards">
            ${values.map(
              (v) => html`<li class="value-card reveal">
                <span class="value-card__icon">${icon(v.icon ?? "heart")}</span>
                <h3>${v.title}</h3>
                <p>${v.text}</p>
              </li>`,
            )}
          </ul>
        </div>
      </section>`
    : ""}

  <section class="section section--tight">
    <div class="container">
      <div class="cta-band screws reveal">
        <div>
          <h2>Envie de nous rejoindre&nbsp;?</h2>
          <p>Bricoleur·se débutant·e ou confirmé·e, passionné·e de logiciel libre ou simplement curieux·se : il y a une place pour toi.</p>
        </div>
        <a class="btn btn--light btn--lg" href="/contact/?sujet=rejoindre">${icon("hand-heart")} Rejoindre l'équipe</a>
      </div>
    </div>
  </section>`;

  return layout(ctx, {
    path: "/a-propos/",
    title: "À propos",
    description: a.intro ?? config.description,
    body,
  });
}
