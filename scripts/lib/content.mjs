import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { Marked } from "marked";
import YAML from "yaml";
import config from "../../src/site.config.mjs";
import { dateOnly, parisToDate } from "./dates.mjs";
import { esc, normalize, slugify } from "./utils.mjs";

const CONTENT = path.resolve("content");

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

let imageDims = new Map();
export const setImageDims = (map) => (imageDims = map);

const ALERTS = {
  note: { label: "À savoir" },
  tip: { label: "Astuce" },
  important: { label: "Important" },
  warning: { label: "Attention" },
};

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    image({ href, title, text }) {
      const dim = imageDims.get(href);
      const size = dim ? ` width="${dim.width}" height="${dim.height}"` : "";
      const img = `<img src="${esc(href)}" alt="${esc(text)}"${size} loading="lazy" decoding="async">`;
      return title ? `<figure>${img}<figcaption>${esc(title)}</figcaption></figure>` : `<figure>${img}</figure>`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//i.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ""}${attrs}>${text}</a>`;
    },
    blockquote({ tokens, text }) {
      const body = this.parser.parse(tokens);
      const m = /^\s*\[!(note|tip|important|warning)\]/i.exec(text);
      if (!m) return `<blockquote>${body}</blockquote>`;
      const kind = m[1].toLowerCase();
      const cleaned = body.replace(/^<p>\s*\[![a-z]+\]\s*(<br\s*\/?>)?\s*/i, "<p>").replace("<p></p>", "");
      return `<aside class="callout callout--${kind}"><p class="callout__title">${ALERTS[kind].label}</p>${cleaned}</aside>`;
    },
    table({ header, rows }) {
      const cell = (c, tag) => `<${tag}${c.align ? ` style="text-align:${c.align}"` : ""}>${this.parser.parseInline(c.tokens)}</${tag}>`;
      const head = `<tr>${header.map((c) => cell(c, "th")).join("")}</tr>`;
      const body = rows.map((r) => `<tr>${r.map((c) => cell(c, "td")).join("")}</tr>`).join("");
      return `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
    },
  },
});

export const renderMarkdown = (md) => marked.parse(md ?? "");

/** Texte brut approximatif d'un markdown (index de recherche, JSON-LD). */
export function markdownToText(md = "") {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^>\s*\[![a-z]+\]/gim, "")
    .replace(/[#>*_`|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* Fichiers markdown + frontmatter                                     */
/* ------------------------------------------------------------------ */

async function readEntries(dir) {
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const files = names.filter((n) => n.endsWith(".md") && !n.startsWith("_"));
  return Promise.all(
    files.map(async (name) => {
      const file = path.join(dir, name);
      const source = await readFile(file, "utf8");
      const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!m) throw new Error(`${name} : le fichier doit commencer par un bloc "---" (frontmatter).`);
      let data;
      try {
        data = YAML.parse(m[1]) ?? {};
      } catch (e) {
        throw new Error(`${name} : frontmatter YAML invalide — ${e.message}`);
      }
      return { name, slug: name.replace(/\.md$/, ""), data, body: m[2].trim() };
    }),
  );
}

function required(entry, fields) {
  const missing = fields.filter((f) => entry.data[f] === undefined || entry.data[f] === null || entry.data[f] === "");
  if (missing.length) throw new Error(`${entry.name} : champ(s) obligatoire(s) manquant(s) : ${missing.join(", ")}`);
}

const asList = (v) => (Array.isArray(v) ? v.map(String) : v ? [String(v)] : []);

/* ------------------------------------------------------------------ */
/* Rendez-vous                                                         */
/* ------------------------------------------------------------------ */

export async function loadEvents(now = new Date(), { includeDrafts = false } = {}) {
  const entries = await readEntries(path.join(CONTENT, "events"));
  const events = entries
    .filter((e) => includeDrafts || !e.data.draft)
    .map((e) => {
      required(e, ["title", "type", "start", "location"]);
      if (!config.eventTypes[e.data.type]) {
        throw new Error(`${e.name} : type "${e.data.type}" inconnu (valeurs : ${Object.keys(config.eventTypes).join(", ")})`);
      }
      const start = parisToDate(e.data.start);
      const end = e.data.end ? parisToDate(e.data.end) : new Date(start.getTime() + 2 * 3600e3);
      return {
        slug: e.slug,
        title: e.data.title,
        type: e.data.type,
        typeLabel: config.eventTypes[e.data.type].label,
        start,
        end,
        location: e.data.location,
        address: e.data.address ?? "",
        image: e.data.image ?? "",
        imageAlt: e.data.image_alt ?? "",
        summary: e.data.summary ?? "",
        price: e.data.price ?? "Gratuit",
        registrationUrl: e.data.registration_url ?? "",
        bodyMd: e.body,
        html: renderMarkdown(e.body),
        text: markdownToText(e.body),
        upcoming: end >= now,
      };
    });
  return events.sort((a, b) => a.start - b.start);
}

/* ------------------------------------------------------------------ */
/* Guides                                                              */
/* ------------------------------------------------------------------ */

const EXTRA_SECTION = /^(pour )?(aller plus loin|conclusion|ressources|pour finir|et ensuite)/;

export function guideTypeCategory(type) {
  for (const [cat, def] of Object.entries(config.categories)) if (def.types.includes(type)) return cat;
  return null;
}

export async function loadGuides({ includeDrafts = false } = {}) {
  const entries = await readEntries(path.join(CONTENT, "guides"));
  const guides = entries
    .filter((e) => includeDrafts || !e.data.draft)
    .map((e) => {
      required(e, ["title", "author", "date", "category", "summary"]);
      const d = e.data;
      if (!config.categories[d.category]) {
        throw new Error(`${e.name} : catégorie "${d.category}" inconnue (valeurs : ${Object.keys(config.categories).join(", ")})`);
      }
      const types = asList(d.types);
      for (const t of types) {
        if (!config.categories[d.category].types.includes(t)) {
          console.warn(`⚠ ${e.name} : le type "${t}" n'existe pas dans la catégorie "${d.category}" (voir src/site.config.mjs).`);
        }
      }
      if (d.difficulty && !config.difficulties[d.difficulty]) {
        throw new Error(`${e.name} : difficulté "${d.difficulty}" inconnue (valeurs : ${Object.keys(config.difficulties).join(", ")})`);
      }

      // Découpage : intro (avant le 1er "##") puis une étape par titre de niveau 2.
      const tokens = marked.lexer(e.body);
      const intro = [];
      const sections = [];
      let current = null;
      for (const tok of tokens) {
        if (tok.type === "heading" && tok.depth === 2) {
          current = { title: tok.text, tokens: [] };
          sections.push(current);
        } else if (current) current.tokens.push(tok);
        else intro.push(tok);
      }
      intro.links = tokens.links;
      let n = 0;
      const steps = sections.map((s) => {
        s.tokens.links = tokens.links;
        const clean = s.title.replace(/^[ée]tape\s*\d+\s*[:\-–—.]?\s*/i, "").trim() || s.title;
        const extra = EXTRA_SECTION.test(normalize(clean));
        if (!extra) n += 1;
        return {
          kind: extra ? "extra" : "step",
          number: extra ? null : n,
          id: extra ? slugify(clean) : `etape-${n}`,
          title: clean,
          html: marked.parser(s.tokens),
        };
      });

      const words = markdownToText(e.body).split(/\s+/).filter(Boolean).length;
      const date = dateOnly(d.date);
      return {
        slug: e.slug,
        title: d.title,
        author: d.author,
        date,
        dateIso: String(d.date).slice(0, 10),
        category: d.category,
        types,
        difficulty: d.difficulty ?? "",
        duration: d.duration ?? "",
        summary: d.summary,
        cover: d.cover ?? "",
        coverAlt: d.cover_alt ?? "",
        materials: asList(d.materials),
        introHtml: intro.length ? marked.parser(intro) : "",
        steps,
        readingMinutes: Math.max(1, Math.round(words / 200)),
        searchText: markdownToText(`${asList(d.materials).join(" ")} ${e.body}`),
      };
    });
  return guides.sort((a, b) => b.date - a.date || a.title.localeCompare(b.title, "fr"));
}

/* ------------------------------------------------------------------ */
/* Page « À propos »                                                   */
/* ------------------------------------------------------------------ */

export async function loadAbout() {
  const entries = await readEntries(CONTENT).then((all) => all.filter((e) => e.slug === "about"));
  if (!entries.length) throw new Error("content/about.md introuvable.");
  const e = entries[0];
  return { ...e.data, html: renderMarkdown(e.body) };
}
