import { html, raw, truncate } from "../../scripts/lib/utils.mjs";
import { icon } from "../../scripts/lib/icons.mjs";

/**
 * Gabarit commun à toutes les pages.
 * @param ctx   contexte de build (config, assets, siteUrl…)
 * @param page  { title, description, path, body, scripts, ogImage, jsonld, bodyClass, noindex }
 */
export function layout(ctx, page) {
  const { config, assets, siteUrl } = ctx;
  const fullTitle = page.path === "/" ? `${config.name} — ${config.tagline}` : `${page.title} · ${config.name}`;
  const description = truncate(page.description || config.description);
  const url = new URL(page.path, siteUrl).href;
  const ogImage = new URL(page.ogImage || "/og-image.jpg", siteUrl).href;
  const scripts = ["main", ...(page.scripts ?? [])];

  return html`<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${url}">
  ${page.noindex ? raw('<meta name="robots" content="noindex">') : ""}
  <meta name="theme-color" content="#A60321">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${config.name}">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preload" href="/assets/fonts/fredoka.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${assets.css}">
  <script>document.documentElement.classList.add("js")</script>
  ${(page.jsonld ?? []).map((j) => raw(`<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`))}
</head>
<body class="${page.bodyClass ?? ""}">
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  ${header(ctx, page.path)}
  <main id="contenu" tabindex="-1">
    ${page.body}
  </main>
  ${footer(ctx)}
  ${scripts.map((s) => raw(`<script src="${assets.js[s]}" defer></script>`))}
</body>
</html>`;
}

function header({ config }, current) {
  const isActive = (href) => (href === "/" ? current === "/" : current.startsWith(href));
  return html`<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="/" aria-label="${config.name} — accueil">
      <img src="/img/brand/logo-icon-128.webp" width="44" height="44" alt="" class="brand__icon">
      <span class="brand__name">Repair <span class="brand__n">n'</span> Learn</span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu" data-nav-toggle>
      <span class="visually-hidden">Menu</span>
      <span class="nav-toggle__bars" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
    <nav class="nav" id="menu" aria-label="Navigation principale" data-nav>
      <ul class="nav__list">
        ${config.nav.map(
          (item) => html`<li><a class="nav__link" href="${item.href}" ${isActive(item.href) ? raw('aria-current="page"') : ""}>${item.label}</a></li>`,
        )}
        <li class="nav__cta"><a class="btn btn--primary btn--sm" href="/contact/" ${current.startsWith("/contact") ? raw('aria-current="page"') : ""}>Nous contacter</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}

function footer({ config }) {
  const year = new Date().getFullYear();
  return html`<footer class="site-footer">
  <div class="container site-footer__grid">
    <div class="site-footer__brand">
      <img src="/img/brand/wordmark-640.webp" width="640" height="305" alt="${config.name}" class="site-footer__logo" loading="lazy">
      <p>Association étudiante : on répare, on partage, on apprend — repair cafés et interventions open source.</p>
    </div>
    <nav aria-label="Pied de page">
      <h2 class="site-footer__title">Explorer</h2>
      <ul class="site-footer__links">
        ${config.nav.map((i) => html`<li><a href="${i.href}">${i.label}</a></li>`)}
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </nav>
    <div>
      <h2 class="site-footer__title">Nous suivre</h2>
      <ul class="site-footer__links">
        <li><a href="mailto:${config.email}">${icon("mail")} ${config.email}</a></li>
        <li><a href="${config.social.instagram}" target="_blank" rel="noopener noreferrer">${icon("instagram")} Instagram</a></li>
        <li><a href="${config.social.facebook}" target="_blank" rel="noopener noreferrer">${icon("facebook")} Facebook</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p>© ${year} ${config.name}. Fait avec ${icon("heart", "icon--inline")} par des étudiants, pour tout le monde.</p>
  </div>
</footer>`;
}
