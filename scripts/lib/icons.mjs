import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { raw } from "./utils.mjs";

const ICON_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../node_modules/lucide-static/icons");
const cache = new Map();

/** Corps SVG (sans la balise <svg>) d'une icône Lucide. */
export function iconBody(name) {
  if (!cache.has(name)) {
    let svg;
    try {
      svg = readFileSync(path.join(ICON_DIR, `${name}.svg`), "utf8");
    } catch {
      throw new Error(`Icône Lucide introuvable : "${name}"`);
    }
    const body = svg
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<svg[\s\S]*?>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
    cache.set(name, body);
  }
  return cache.get(name);
}

/** Icône inline, hérite de la couleur du texte (currentColor). */
export function icon(name, className = "") {
  return raw(
    `<svg class="icon${className ? " " + className : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconBody(name)}</svg>`,
  );
}
