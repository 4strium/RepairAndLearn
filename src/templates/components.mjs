import config from "../site.config.mjs";
import { icon } from "../../scripts/lib/icons.mjs";
import { esc, html, raw } from "../../scripts/lib/utils.mjs";
import { formatDay, formatFull, formatGuideDate, formatMonthShort, formatTime, formatDayMonth } from "../../scripts/lib/dates.mjs";

/* ------------------------------------------------------------------ */
/* Briques génériques                                                  */
/* ------------------------------------------------------------------ */

/** « Sticker » inspiré du logo (aplat sable, bord arrondi, léger relief). */
export const sticker = (label, { iconName, tone = "tan" } = {}) =>
  html`<span class="sticker sticker--${tone}">${iconName ? icon(iconName) : ""}${label}</span>`;

export function sectionHead({ eyebrow, title, intro, linkHref, linkLabel }) {
  return html`<div class="section-head reveal">
    <div>
      ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ""}
      <h2 class="section-title">${title}</h2>
      ${intro ? html`<p class="section-intro">${intro}</p>` : ""}
    </div>
    ${linkHref ? html`<a class="link-arrow" href="${linkHref}">${linkLabel} ${icon("arrow-right")}</a>` : ""}
  </div>`;
}

export function pageHero({ eyebrow, title, intro, extra }) {
  return html`<section class="page-hero">
    <div class="container page-hero__inner">
      ${eyebrow ? html`<p class="eyebrow reveal">${eyebrow}</p>` : ""}
      <h1 class="page-hero__title reveal">${title}</h1>
      ${intro ? html`<p class="page-hero__intro reveal">${intro}</p>` : ""}
      ${extra ?? ""}
    </div>
    <span class="page-hero__blob page-hero__blob--a" aria-hidden="true"></span>
    <span class="page-hero__blob page-hero__blob--b" aria-hidden="true"></span>
  </section>`;
}

/** Visuel de secours quand un rendez-vous / guide n'a pas d'image. */
function fallbackCover(kind) {
  const name = config.categories[kind]?.icon ?? config.eventTypes[kind]?.icon ?? "wrench";
  const tone = kind === "open-source" ? "os" : "repair";
  return html`<span class="cover cover--${tone}" aria-hidden="true">${icon(name)}</span>`;
}

function media({ src, alt, kind, priority = false, dims }) {
  if (!src) return fallbackCover(kind);
  const d = dims?.get(src);
  const size = d ? ` width="${d.width}" height="${d.height}"` : "";
  return raw(
    `<img src="${esc(src)}" alt="${esc(alt ?? "")}"${size} ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`,
  );
}

/* ------------------------------------------------------------------ */
/* Rendez-vous                                                         */
/* ------------------------------------------------------------------ */

export function dateBadge(ev) {
  return html`<span class="date-badge" aria-hidden="true"><b>${formatDay(ev.start)}</b><span>${formatMonthShort(ev.start)}</span></span>`;
}

const timeRange = (ev) => `${formatTime(ev.start)} – ${formatTime(ev.end)}`;
const sameDay = (ev) => formatFull(ev.start) === formatFull(ev.end);

/** Carte complète (page Rendez-vous). Cliquable : ouvre la fenêtre modale. */
export function eventCard(ev, { featured = false, dims } = {}) {
  return html`<li class="reveal ${featured ? "event-item--featured" : ""}" data-event-item data-end="${ev.end.toISOString()}" data-type="${ev.type}">
    <button type="button" class="event-card" data-event-open="${ev.slug}" aria-haspopup="dialog">
      <span class="event-card__media">
        ${media({ src: ev.image, alt: ev.imageAlt, kind: ev.type, dims })}
        ${dateBadge(ev)}
        <span class="event-card__tag">${sticker(ev.typeLabel, { iconName: config.eventTypes[ev.type].icon })}</span>
      </span>
      <span class="event-card__body">
        <span class="event-card__title">${ev.title}</span>
        <span class="event-card__meta">${icon("clock")}<span>${formatDayMonth(ev.start)} · ${timeRange(ev)}</span></span>
        <span class="event-card__meta">${icon("map-pin")}<span>${ev.location}</span></span>
        ${ev.summary ? html`<span class="event-card__summary">${ev.summary}</span>` : ""}
        <span class="event-card__more">Voir les détails ${icon("arrow-right")}</span>
      </span>
    </button>
  </li>`;
}

/** Ligne compacte (accueil). */
export function eventRow(ev) {
  return html`<li class="reveal" data-event-item data-end="${ev.end.toISOString()}" data-type="${ev.type}">
    <button type="button" class="event-row" data-event-open="${ev.slug}" aria-haspopup="dialog">
      ${dateBadge(ev)}
      <span class="event-row__main">
        <span class="event-row__tag">${sticker(ev.typeLabel, { iconName: config.eventTypes[ev.type].icon })}</span>
        <span class="event-row__title">${ev.title}</span>
        <span class="event-row__meta">${icon("clock")} ${formatDayMonth(ev.start)}, ${timeRange(ev)}</span>
        <span class="event-row__meta">${icon("map-pin")} ${ev.location}</span>
      </span>
      <span class="event-row__go" aria-hidden="true">${icon("arrow-right")}</span>
    </button>
  </li>`;
}

/** Événement passé : non cliquable, discret. */
export function pastEventItem(ev) {
  return html`<li class="past-item" data-past-item>
    <span class="past-item__date">${formatDay(ev.start)} ${formatMonthShort(ev.start)}</span>
    <span class="past-item__title">${ev.title}</span>
    <span class="past-item__place">${ev.location}</span>
    <span class="past-item__tag">${ev.typeLabel}</span>
  </li>`;
}

export const mapsUrl = (ev) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent([ev.location, ev.address].filter(Boolean).join(", "))}`;

/** Contenu de la fenêtre modale d'un rendez-vous (dans un <template>). */
export function eventTemplate(ev, { dims } = {}) {
  const multiDay = !sameDay(ev);
  return html`<template id="event-tpl-${ev.slug}" data-title="${ev.title}">
    <article class="event-modal">
      <div class="event-modal__media">
        ${media({ src: ev.image, alt: ev.imageAlt, kind: ev.type, priority: true, dims })}
        <span class="event-modal__tag">${sticker(ev.typeLabel, { iconName: config.eventTypes[ev.type].icon })}</span>
      </div>
      <div class="event-modal__content">
        <header class="event-modal__head">
          ${dateBadge(ev)}
          <h2 class="event-modal__title" id="event-modal-title">${ev.title}</h2>
        </header>
        <ul class="glance">
          <li class="glance__item">
            ${icon("calendar-days")}
            <span><strong>${formatFull(ev.start)}${multiDay ? ` → ${formatFull(ev.end)}` : ""}</strong><small>${timeRange(ev)}</small></span>
          </li>
          <li class="glance__item">
            ${icon("map-pin")}
            <span><strong>${ev.location}</strong>${ev.address ? html`<small>${ev.address}</small>` : ""}</span>
          </li>
          <li class="glance__item">
            ${icon("ticket")}
            <span><strong>${ev.price}</strong><small>${ev.registrationUrl ? "Inscription conseillée" : "Sans inscription"}</small></span>
          </li>
        </ul>
        ${ev.html ? html`<div class="prose prose--sm">${raw(ev.html)}</div>` : ev.summary ? html`<p>${ev.summary}</p>` : ""}
        <div class="event-modal__actions">
          ${ev.registrationUrl
            ? html`<a class="btn btn--primary" href="${ev.registrationUrl}" target="_blank" rel="noopener noreferrer">${icon("ticket")} S'inscrire</a>`
            : ""}
          <a class="btn ${ev.registrationUrl ? "btn--ghost" : "btn--primary"}" href="/rendez-vous/${ev.slug}.ics" download>${icon("calendar-plus")} Ajouter à mon agenda</a>
          <a class="btn btn--ghost" href="${mapsUrl(ev)}" target="_blank" rel="noopener noreferrer">${icon("navigation")} Itinéraire</a>
        </div>
      </div>
    </article>
  </template>`;
}

/** Fenêtre modale unique (élément <dialog> natif : focus piégé + Échap gérés par le navigateur). */
export const eventDialog = () => html`<dialog class="modal" id="event-modal" aria-labelledby="event-modal-title" data-event-dialog>
  <div class="modal__panel">
    <button type="button" class="modal__close" data-modal-close aria-label="Fermer la fenêtre">${icon("x")}</button>
    <div data-modal-body></div>
  </div>
</dialog>`;

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

export function difficultyMeter(key) {
  const d = config.difficulties[key];
  if (!d) return "";
  return html`<span class="difficulty" title="Difficulté : ${d.label}">
    <span class="difficulty__dots" aria-hidden="true">${[1, 2, 3].map((n) => html`<i class="${n <= d.level ? "is-on" : ""}"></i>`)}</span>
    <span>${d.label}</span>
  </span>`;
}

export function guideCard(g, { dims } = {}) {
  const cat = config.categories[g.category];
  return html`<li class="guide-item reveal" data-guide data-slug="${g.slug}" data-cat="${g.category}" data-types="${g.types.join("|")}"
      data-title="${g.title}" data-summary="${g.summary}" data-tags="${g.types.join(" ")} ${g.author}">
    <a class="guide-card" href="/guides/${g.slug}/">
      <span class="guide-card__media">
        ${media({ src: g.cover, alt: g.coverAlt, kind: g.category, dims })}
        <span class="guide-card__tag">${sticker(cat.label, { iconName: cat.icon })}</span>
      </span>
      <span class="guide-card__body">
        <span class="chips">${g.types.map((t) => html`<span class="chip chip--static">${t}</span>`)}</span>
        <span class="guide-card__title">${g.title}</span>
        <span class="guide-card__summary">${g.summary}</span>
        <span class="guide-card__meta">
          <span>${icon("user-round")} ${g.author}</span>
          <span>${icon("calendar-days")} <time datetime="${g.dateIso}">${formatGuideDate(g.date)}</time></span>
          ${g.difficulty ? difficultyMeter(g.difficulty) : ""}
        </span>
      </span>
    </a>
  </li>`;
}

export { media };
