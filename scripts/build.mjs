#!/usr/bin/env node
/**
 * Générateur du site : content/ + src/ + public/  →  dist/
 *
 *     npm run build
 *
 * Aucun framework : des fichiers Markdown, quelques gabarits JS, du CSS et du JS natifs.
 */
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import config from "../src/site.config.mjs";
import { cmsConfigYaml } from "./lib/cms.mjs";
import { loadAbout, loadEvents, loadGuides, setImageDims } from "./lib/content.mjs";
import { buildPublic } from "./lib/images.mjs";
import { ensureDir, hashContent, walk } from "./lib/utils.mjs";
import { aboutPage } from "../src/templates/about.mjs";
import { contactPage, notFoundPage, thanksPage } from "../src/templates/contact.mjs";
import { eventIcs, eventsPage } from "../src/templates/events.mjs";
import { guidePage } from "../src/templates/guide.mjs";
import { guidesPage, guidesSearchIndex } from "../src/templates/guides.mjs";
import { homePage } from "../src/templates/home.mjs";

const t0 = performance.now();
const DIST = path.resolve("dist");
const PUBLIC = path.resolve("public");
const SRC = path.resolve("src");

const siteUrl = (process.env.URL || config.siteUrl).replace(/\/$/, "");
const now = process.env.BUILD_NOW ? new Date(process.env.BUILD_NOW) : new Date();
const includeDrafts = process.env.DEV_SERVER === "true";

async function write(rel, content) {
  const file = path.join(DIST, rel);
  await ensureDir(path.dirname(file));
  await writeFile(file, content.toString());
}

/** URL propre : "/guides/" -> dist/guides/index.html */
const writePage = (urlPath, html) => write(urlPath.endsWith("/") ? `${urlPath}index.html` : urlPath, html);

/* ---------- Assets (CSS / JS hachés pour un cache longue durée) ---------- */
async function buildAssets() {
  const assets = { css: "", js: {} };
  await ensureDir(path.join(DIST, "assets/fonts"));

  const cssFiles = (await walk(path.join(SRC, "css"))).filter((f) => f.endsWith(".css")).sort();
  const css = (await Promise.all(cssFiles.map((f) => readFile(f, "utf8")))).join("\n");
  const cssName = `site.${hashContent(css)}.css`;
  await write(`assets/${cssName}`, css);
  assets.css = `/assets/${cssName}`;

  for (const file of (await walk(path.join(SRC, "js"))).filter((f) => f.endsWith(".js"))) {
    const name = path.basename(file, ".js");
    const code = await readFile(file, "utf8");
    const out = `${name}.${hashContent(code)}.js`;
    await write(`assets/${out}`, code);
    assets.js[name] = `/assets/${out}`;
  }

  // Polices auto-hébergées (aucune requête vers Google Fonts → RGPD + rapidité).
  const fonts = [
    ["@fontsource-variable/fredoka/files/fredoka-latin-wght-normal.woff2", "fredoka.woff2"],
    ["@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", "inter.woff2"],
  ];
  for (const [from, to] of fonts) await copyFile(path.resolve("node_modules", from), path.join(DIST, "assets/fonts", to));

  return assets;
}

/* ---------- Build ---------- */
async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const [dims, assets] = await Promise.all([buildPublic(PUBLIC, DIST), buildAssets()]);
  setImageDims(dims);

  const [events, guides, about] = await Promise.all([
      loadEvents(now, { includeDrafts }),
      loadGuides({ includeDrafts }),
      loadAbout(),
    ]);
  const ctx = { config, siteUrl, assets, events, guides, about, dims, now };

  // Pages
  await writePage("/", homePage(ctx));
  await writePage("/rendez-vous/", eventsPage(ctx));
  await writePage("/guides/", guidesPage(ctx));
  for (const g of guides) await writePage(`/guides/${g.slug}/`, guidePage(ctx, g));
  await writePage("/contact/", contactPage(ctx));
  await writePage("/a-propos/", aboutPage(ctx));
  await writePage("/merci/", thanksPage(ctx));
  await writePage("/404.html", notFoundPage(ctx));

  // Fichiers annexes
  await write("guides/search-index.json", JSON.stringify(guidesSearchIndex(guides)));
  for (const e of events.filter((e) => e.upcoming)) await write(`rendez-vous/${e.slug}.ics`, eventIcs(e, ctx));

  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/rendez-vous/", priority: "0.9" },
    { loc: "/guides/", priority: "0.9" },
    ...guides.map((g) => ({ loc: `/guides/${g.slug}/`, lastmod: g.dateIso, priority: "0.7" })),
    { loc: "/a-propos/", priority: "0.6" },
    { loc: "/contact/", priority: "0.6" },
  ];
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${siteUrl}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}<priority>${u.priority}</priority></url>`)
      .join("\n")}\n</urlset>\n`,
  );
  await write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  await write("admin/config.yml", cmsConfigYaml(config, siteUrl));

  const ms = Math.round(performance.now() - t0);
  console.log(
    `✔ Site généré dans dist/ en ${ms} ms — ${events.length} rendez-vous (${events.filter((e) => e.upcoming).length} à venir), ${guides.length} guides.`,
  );
}

main().catch((err) => {
  console.error(`\n✖ Échec de la génération du site :\n  ${err.message}\n`);
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
