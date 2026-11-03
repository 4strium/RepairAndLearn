import { createHash } from "node:crypto";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

/** Échappe une chaîne pour l'insérer dans du HTML (texte ou attribut). */
export function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Marque une chaîne comme du HTML déjà sûr (pour les templates). */
export class Safe extends String {}
export const raw = (s) => new Safe(s);

/**
 * Tag de template : échappe toutes les valeurs interpolées sauf celles
 * marquées `raw()` ou provenant d'un autre `html\`\``. Les tableaux sont joints.
 */
export function html(strings, ...values) {
  let out = "";
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) out += render(values[i]);
  });
  return new Safe(out);
}

function render(v) {
  if (v === null || v === undefined || v === false) return "";
  if (v instanceof Safe) return v.toString();
  if (Array.isArray(v)) return v.map(render).join("");
  return esc(v);
}

export function slugify(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalisation pour la recherche : minuscules, sans accents. */
export function normalize(str) {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function hashContent(content) {
  return createHash("sha1").update(content).digest("hex").slice(0, 10);
}

export async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

export async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export const ensureDir = (dir) => mkdir(dir, { recursive: true });

/** Tronque un texte proprement (pour les descriptions SEO). */
export function truncate(text, max = 155) {
  const t = String(text).replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}
