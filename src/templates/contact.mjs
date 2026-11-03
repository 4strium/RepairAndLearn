import { icon } from "../../scripts/lib/icons.mjs";
import { html } from "../../scripts/lib/utils.mjs";
import { layout } from "./layout.mjs";
import { pageHero } from "./components.mjs";

const SUBJECTS = [
  { key: "repair-cafe", label: "Repair café (apporter un objet, devenir bénévole…)" },
  { key: "intervention", label: "Intervention open source / atelier" },
  { key: "guide", label: "Guide : suggestion, correction ou contribution" },
  { key: "rejoindre", label: "Rejoindre l'association" },
  { key: "autre", label: "Autre demande" },
];

export function contactPage(ctx) {
  const { config } = ctx;

  const body = html`
  ${pageHero({
    eyebrow: "On discute ?",
    title: "Nous contacter",
    intro: "Une question, un objet à réparer, une intervention à organiser ? Écris-nous, on lit tout et on répond dès que possible.",
  })}

  <section class="section section--flush-top">
    <div class="container contact-grid">
      <div class="card form-card reveal">
        <form name="contact" method="POST" action="/merci/" data-netlify="true" netlify-honeypot="bot-field" data-contact-form novalidate>
          <input type="hidden" name="form-name" value="contact">
          <p class="visually-hidden" aria-hidden="true">
            <label>Ne pas remplir si vous êtes humain : <input name="bot-field" tabindex="-1" autocomplete="off"></label>
          </p>

          <div class="field-row">
            <div class="field">
              <label for="c-name">Ton nom <span class="req" aria-hidden="true">*</span></label>
              <input id="c-name" name="nom" type="text" autocomplete="name" required>
              <p class="field__error" data-error-for="c-name" hidden></p>
            </div>
            <div class="field">
              <label for="c-email">Ton e-mail <span class="req" aria-hidden="true">*</span></label>
              <input id="c-email" name="email" type="email" autocomplete="email" required inputmode="email">
              <p class="field__error" data-error-for="c-email" hidden></p>
            </div>
          </div>

          <div class="field">
            <label for="c-subject">Sujet</label>
            <div class="select-wrap">
              <select id="c-subject" name="sujet">
                ${SUBJECTS.map((s, i) => html`<option value="${s.label}" data-key="${s.key}" ${i === SUBJECTS.length - 1 ? "selected" : ""}>${s.label}</option>`)}
              </select>
              ${icon("chevron-down")}
            </div>
          </div>

          <div class="field">
            <label for="c-message">Ton message <span class="req" aria-hidden="true">*</span></label>
            <textarea id="c-message" name="message" rows="6" required minlength="10"></textarea>
            <p class="field__error" data-error-for="c-message" hidden></p>
          </div>

          <div class="field field--check">
            <label class="check">
              <input type="checkbox" id="c-consent" name="consentement" value="oui" required>
              <span>J'accepte que ces informations soient utilisées uniquement pour répondre à ma demande. <span class="req" aria-hidden="true">*</span></span>
            </label>
            <p class="field__error" data-error-for="c-consent" hidden></p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn--primary btn--lg" data-submit>${icon("send")} <span>Envoyer le message</span></button>
            <p class="muted form-note"><span class="req" aria-hidden="true">*</span> Champs obligatoires</p>
          </div>

          <p class="form-status form-status--error" role="alert" data-form-error hidden>
            L'envoi n'a pas fonctionné. Tu peux nous écrire directement à <a href="mailto:${config.email}">${config.email}</a>.
          </p>
        </form>

        <div class="form-success" data-form-success hidden tabindex="-1">
          <span class="form-success__icon">${icon("circle-check")}</span>
          <h2>Message envoyé&nbsp;!</h2>
          <p>Merci, on te répond très vite à l'adresse indiquée.</p>
          <button type="button" class="btn btn--ghost" data-form-again>Envoyer un autre message</button>
        </div>
      </div>

      <aside class="contact-side">
        <div class="card side-card reveal">
          <span class="side-card__icon">${icon("mail")}</span>
          <h2>Par e-mail</h2>
          <a class="side-card__main" href="mailto:${config.email}">${config.email}</a>
          <button type="button" class="link-btn" data-copy="${config.email}">${icon("copy")} <span>Copier l'adresse</span></button>
        </div>

        <div class="card side-card reveal">
          <span class="side-card__icon">${icon("message-circle")}</span>
          <h2>Sur les réseaux</h2>
          <p class="muted">Les dates des prochains rendez-vous y sont aussi annoncées.</p>
          <ul class="social-list">
            <li><a class="social-link social-link--instagram" href="${config.social.instagram}" target="_blank" rel="noopener noreferrer">${icon("instagram")}<span><strong>Instagram</strong><small>@repair.and.learn</small></span>${icon("arrow-up-right")}</a></li>
            <li><a class="social-link social-link--facebook" href="${config.social.facebook}" target="_blank" rel="noopener noreferrer">${icon("facebook")}<span><strong>Facebook</strong><small>Repair n' Learn</small></span>${icon("arrow-up-right")}</a></li>
          </ul>
        </div>

        <div class="card side-card side-card--accent reveal">
          <span class="side-card__icon">${icon("wrench")}</span>
          <h2>Un objet à réparer&nbsp;?</h2>
          <p>Le plus simple : viens directement à un <a href="/rendez-vous/?type=repair-cafe">repair café</a> avec ton objet.</p>
        </div>
      </aside>
    </div>
  </section>`;

  return layout(ctx, {
    path: "/contact/",
    title: "Nous contacter",
    description: `Contacte l'association Repair n' Learn par formulaire, par e-mail (${config.email}) ou sur Instagram et Facebook.`,
    body,
    scripts: ["contact"],
  });
}

export function thanksPage(ctx) {
  const body = html`
  <section class="section">
    <div class="container container--narrow">
      <div class="card form-success form-success--page">
        <span class="form-success__icon">${icon("circle-check")}</span>
        <h1>Message envoyé&nbsp;!</h1>
        <p>Merci, on te répond très vite à l'adresse indiquée.</p>
        <a class="btn btn--primary" href="/">${icon("arrow-left")} Retour à l'accueil</a>
      </div>
    </div>
  </section>`;
  return layout(ctx, { path: "/merci/", title: "Message envoyé", body, noindex: true });
}

export function notFoundPage(ctx) {
  const body = html`
  <section class="section">
    <div class="container container--narrow not-found">
      <img src="/img/brand/logo-icon-512.webp" width="512" height="512" alt="" class="not-found__icon">
      <p class="eyebrow">Erreur 404</p>
      <h1 class="page-hero__title">Cette page est en réparation…</h1>
      <p class="page-hero__intro">Elle n'existe pas (ou plus). Pas de panique : le reste du site fonctionne très bien.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="/">${icon("arrow-left")} Accueil</a>
        <a class="btn btn--ghost btn--lg" href="/guides/">${icon("book-open")} Les guides</a>
      </div>
    </div>
  </section>`;
  return layout(ctx, { path: "/404.html", title: "Page introuvable", body, noindex: true });
}
