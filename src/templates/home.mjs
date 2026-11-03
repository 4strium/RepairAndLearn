import { icon } from "../../scripts/lib/icons.mjs";
import { html, raw } from "../../scripts/lib/utils.mjs";
import { formatDayMonth, formatTime } from "../../scripts/lib/dates.mjs";
import { layout } from "./layout.mjs";
import { eventDialog, eventRow, eventTemplate, guideCard, sectionHead, sticker } from "./components.mjs";

export function homePage(ctx) {
  const { config, events, guides, dims } = ctx;
  const upcoming = events.filter((e) => e.upcoming);
  // On rend un peu plus d'événements que nécessaire : le navigateur masque ceux
  // qui sont passés depuis le dernier déploiement (cf. events.js).
  const homeEvents = upcoming.slice(0, config.homeEvents + 3);
  const next = upcoming[0];
  const latestGuides = guides.slice(0, config.homeGuides);

  const body = html`
  <section class="hero">
    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="reveal">${sticker("Repair café & open source", { iconName: "sparkles" })}</p>
        <h1 class="hero__title reveal">
          On répare.<br>
          On partage.<br>
          <span class="hero__title-accent">On apprend.</span>
        </h1>
        <p class="hero__lead reveal">
          Repair n' Learn, c'est l'association étudiante qui donne une seconde vie à vos objets du quotidien
          et qui fait découvrir l'open source, autour d'un café.
        </p>
        <div class="hero__actions reveal">
          <a class="btn btn--primary btn--lg" href="/rendez-vous/">${icon("calendar-days")} Prochains rendez-vous</a>
          <a class="btn btn--ghost btn--lg" href="/guides/">${icon("book-open")} Parcourir les guides</a>
        </div>
        ${next
          ? html`<button type="button" class="hero-next reveal" data-event-open="${next.slug}" data-event-item data-end="${next.end.toISOString()}" aria-haspopup="dialog">
              <span class="hero-next__label"><span class="hero-next__pulse" aria-hidden="true"></span>Prochain rendez-vous</span>
              <span class="hero-next__title">${next.title}</span>
              <span class="hero-next__meta">${formatDayMonth(next.start)} · ${formatTime(next.start)} · ${next.location}</span>
              <span class="hero-next__go" aria-hidden="true">${icon("arrow-right")}</span>
            </button>`
          : ""}
      </div>

      <div class="hero__visual reveal" aria-hidden="true">
        <div class="hero-panel screws">
          <video class="hero-panel__video" autoplay loop muted playsinline preload="metadata"
                 poster="/animation-poster.webp" width="1280" height="720">
            <source src="/animation.mp4" type="video/mp4">
          </video>
        </div>
        <img class="hero-panel__icon" src="/img/brand/logo-icon-512.webp" width="512" height="512" alt="" loading="lazy">
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="quoi">
    <div class="container">
      ${sectionHead({
        eyebrow: "Ce qu'on fait",
        title: raw("Deux façons de <em>mettre les mains</em> dedans"),
        intro: "Des rendez-vous conviviaux, ouverts à tous, pour réparer et pour comprendre ce qui se cache derrière nos outils numériques.",
      })}
      <div class="pillars">
        <article class="pillar pillar--repair reveal">
          <span class="pillar__icon">${icon("wrench")}</span>
          <h3>Repair café</h3>
          <p>Apportez votre grille-pain, votre jean troué, votre vélo ou votre vieux PC. Des bénévoles vous aident à comprendre la panne et à la réparer — ensemble, sans rien jeter.</p>
          <a class="pillar__link" href="/rendez-vous/?type=repair-cafe">Les prochains repair cafés ${icon("arrow-right")}</a>
        </article>
        <article class="pillar pillar--os reveal">
          <span class="pillar__icon">${icon("terminal")}</span>
          <h3>Interventions open source</h3>
          <p>Install parties, ateliers et présentations pour découvrir les logiciels libres : installer Linux, choisir des outils respectueux, apprendre à contribuer à un projet.</p>
          <a class="pillar__link" href="/contact/?sujet=intervention">Nous inviter pour une intervention ${icon("arrow-right")}</a>
        </article>
      </div>
      <ul class="values">
        <li class="reveal">${icon("recycle")}<div><strong>Réparer plutôt que jeter</strong><span>Moins de déchets, plus d'autonomie.</span></div></li>
        <li class="reveal">${icon("graduation-cap")}<div><strong>Apprendre en faisant</strong><span>Chaque réparation est une leçon partagée.</span></div></li>
        <li class="reveal">${icon("heart-handshake")}<div><strong>Ouvert à toutes et tous</strong><span>Étudiants, voisins, curieux : bienvenue.</span></div></li>
      </ul>
    </div>
  </section>

  <section class="section section--tint" aria-labelledby="rdv">
    <div class="container">
      ${sectionHead({
        eyebrow: "Agenda",
        title: "Nos prochains rendez-vous",
        intro: "Clique sur un rendez-vous pour voir tous les détails.",
        linkHref: "/rendez-vous/",
        linkLabel: "Tout l'agenda",
      })}
      ${homeEvents.length
        ? html`<ul class="event-rows" data-event-list data-limit="${config.homeEvents}">${homeEvents.map(eventRow)}</ul>`
        : ""}
      <div class="empty-state" data-empty ${homeEvents.length ? "hidden" : ""}>
        ${icon("calendar-days")}
        <p><strong>Pas de rendez-vous annoncé pour le moment.</strong></p>
        <p>Suis-nous sur <a href="${config.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a> ou <a href="${config.social.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a> pour être prévenu de la prochaine date.</p>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="guides">
    <div class="container">
      ${sectionHead({
        eyebrow: "Guides",
        title: "Apprends à réparer (et à installer)",
        intro: "Des tutoriels pas à pas écrits par les membres de l'association.",
        linkHref: "/guides/",
        linkLabel: "Tous les guides",
      })}
      <form class="quick-search reveal" action="/guides/" method="get" role="search">
        ${icon("search")}
        <label class="visually-hidden" for="home-q">Rechercher un guide</label>
        <input id="home-q" type="search" name="q" placeholder="Rechercher un guide : « vélo », « Linux », « couture »…" autocomplete="off">
        <button class="btn btn--primary btn--sm" type="submit">Rechercher</button>
      </form>
      <ul class="card-grid">${latestGuides.map((g) => guideCard(g, { dims }))}</ul>
    </div>
  </section>

  <section class="section section--tight">
    <div class="container">
      <div class="cta-band screws reveal">
        <div>
          <h2>Un objet en panne&nbsp;? Une idée d'atelier&nbsp;?</h2>
          <p>Écris-nous : on te répond avec plaisir, que ce soit pour réparer, intervenir dans ta classe ou rejoindre l'équipe.</p>
        </div>
        <a class="btn btn--light btn--lg" href="/contact/">${icon("mail")} Nous contacter</a>
      </div>
    </div>
  </section>

  ${eventDialog()}
  ${homeEvents.map((e) => eventTemplate(e, { dims }))}`;

  const jsonld = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: config.name,
      url: ctx.siteUrl,
      logo: new URL("/icon-512.png", ctx.siteUrl).href,
      email: config.email,
      description: config.description,
      sameAs: [config.social.facebook, config.social.instagram],
    },
  ];

  return layout(ctx, { path: "/", title: config.name, description: config.description, body, scripts: ["events"], jsonld });
}
