import { icon } from "../../scripts/lib/icons.mjs";
import { html } from "../../scripts/lib/utils.mjs";
import { formatFull, formatTime } from "../../scripts/lib/dates.mjs";
import { layout } from "./layout.mjs";
import { eventCard, eventDialog, eventTemplate, pageHero, pastEventItem, sectionHead } from "./components.mjs";

export function eventsPage(ctx) {
  const { config, events, dims } = ctx;
  const upcoming = events.filter((e) => e.upcoming);
  const past = events.filter((e) => !e.upcoming).reverse();
  const types = Object.entries(config.eventTypes);

  const body = html`
  ${pageHero({
    eyebrow: "Agenda",
    title: "Nos prochains rendez-vous",
    intro: "Repair cafés et interventions open source : retrouve toutes les dates, les lieux et les infos pratiques. Clique sur un rendez-vous pour en voir le détail.",
  })}

  <section class="section section--flush-top">
    <div class="container">
      <div class="toolbar reveal">
        <div class="segmented" role="group" aria-label="Filtrer par type de rendez-vous" data-event-filters>
          <button type="button" class="segmented__btn" data-filter="all" aria-pressed="true">Tous</button>
          ${types.map(
            ([key, t]) => html`<button type="button" class="segmented__btn" data-filter="${key}" aria-pressed="false">${icon(t.icon)} ${t.label}</button>`,
          )}
        </div>
        <p class="toolbar__count" aria-live="polite" data-event-count></p>
      </div>

      ${upcoming.length
        ? html`<ul class="event-grid" data-event-list>${upcoming.map((e, i) => eventCard(e, { featured: i === 0 && upcoming.length > 1, dims }))}</ul>`
        : ""}

      <div class="empty-state" data-empty ${upcoming.length ? "hidden" : ""}>
        ${icon("calendar-days")}
        <p><strong>Aucun rendez-vous à venir pour cette sélection.</strong></p>
        <p>Les prochaines dates sont annoncées sur <a href="${config.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a> et <a href="${config.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a>.</p>
      </div>
    </div>
  </section>

  <section class="section section--tint section--tight" aria-labelledby="passes">
    <div class="container container--narrow">
      ${sectionHead({ eyebrow: "Archives", title: "Rendez-vous passés" })}
      ${past.length
        ? html`<ul class="past-list reveal">${past.map(pastEventItem)}</ul>`
        : html`<p class="muted">Pas encore d'archives : le premier rendez-vous arrive bientôt.</p>`}
    </div>
  </section>

  <section class="section section--tight">
    <div class="container">
      <div class="cta-band reveal">
        <div>
          <h2>Tu veux qu'on intervienne chez toi&nbsp;?</h2>
          <p>Cours, club, association, entreprise : on peut organiser un atelier de réparation ou une intervention sur l'open source.</p>
        </div>
        <a class="btn btn--light btn--lg" href="/contact/?sujet=intervention">${icon("mail")} Proposer une date</a>
      </div>
    </div>
  </section>

  ${eventDialog()}
  ${upcoming.map((e) => eventTemplate(e, { dims }))}`;

  const jsonld = upcoming.map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.start.toISOString(),
    endDate: e.end.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.location, address: e.address || e.location },
    description: e.summary || e.text.slice(0, 200),
    image: e.image ? [new URL(e.image, ctx.siteUrl).href] : undefined,
    organizer: { "@type": "Organization", name: config.name, url: ctx.siteUrl },
    offers: { "@type": "Offer", price: /gratuit/i.test(e.price) ? "0" : undefined, priceCurrency: "EUR", availability: "https://schema.org/InStock" },
  }));

  return layout(ctx, {
    path: "/rendez-vous/",
    title: "Nos prochains rendez-vous",
    description: upcoming[0]
      ? `Prochain rendez-vous : ${upcoming[0].title}, le ${formatFull(upcoming[0].start).toLowerCase()} à ${formatTime(upcoming[0].start)} (${upcoming[0].location}). Repair cafés et interventions open source.`
      : "Repair cafés et interventions open source : dates, lieux et infos pratiques.",
    body,
    scripts: ["events"],
    jsonld,
  });
}

/** Fichier .ics (ajout à l'agenda) pour un rendez-vous. */
export function eventIcs(ev, ctx) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escText = (s = "") => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const desc = [ev.summary, `Plus d'infos : ${new URL("/rendez-vous/", ctx.siteUrl).href}`].filter(Boolean).join("\n\n");
  const fold = (line) => line.replace(/(.{1,73})(?=.)/g, "$1\r\n ");
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${ctx.config.name}//Site web//FR`,
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${ev.slug}@${new URL(ctx.siteUrl).hostname}`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(ev.start)}`,
      `DTEND:${fmt(ev.end)}`,
      fold(`SUMMARY:${escText(`${ev.title} — ${ctx.config.name}`)}`),
      fold(`LOCATION:${escText([ev.location, ev.address].filter(Boolean).join(", "))}`),
      fold(`DESCRIPTION:${escText(desc)}`),
      `URL:${new URL("/rendez-vous/", ctx.siteUrl).href}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n"
  );
}
