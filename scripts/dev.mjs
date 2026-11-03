#!/usr/bin/env node
/**
 * Serveur de développement : construit le site, le sert sur http://localhost:8888
 * et le reconstruit (avec rechargement automatique de la page) à chaque modification.
 *
 *     npm run dev
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, watch } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT) || 8888;
const DIST = path.resolve("dist");
const WATCHED = ["src", "content", "public", "scripts"];
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ics": "text/calendar; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const clients = new Set();
let building = false;
let queued = false;

function build() {
  if (building) {
    queued = true;
    return Promise.resolve();
  }
  building = true;
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["scripts/build.mjs"], {
      stdio: "inherit",
      env: { ...process.env, URL: process.env.URL ?? `http://localhost:${PORT}` },
    });
    child.on("exit", (code) => {
      building = false;
      if (code === 0) clients.forEach((res) => res.write("data: reload\n\n"));
      if (queued) {
        queued = false;
        build();
      }
      resolve();
    });
  });
}

const reloadSnippet = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const target = path.join(DIST, path.normalize(clean));
  if (!target.startsWith(DIST)) return null;
  if (existsSync(target) && statSync(target).isDirectory()) {
    const index = path.join(target, "index.html");
    return existsSync(index) ? index : null;
  }
  return existsSync(target) ? target : null;
}

const server = createServer((req, res) => {
  if (req.url === "/__reload") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write("\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  // Simule Netlify Forms : tout POST sur "/" réussit.
  if (req.method === "POST") {
    req.resume();
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok (simulation locale de Netlify Forms)");
    });
    return;
  }
  let file = resolveFile(req.url);
  let status = 200;
  if (!file) {
    file = path.join(DIST, "404.html");
    status = 404;
  }
  try {
    const ext = path.extname(file);
    let data = readFileSync(file);
    if (ext === ".html") data = Buffer.from(data.toString().replace("</body>", `${reloadSnippet}</body>`));
    res.writeHead(status, { "Content-Type": TYPES[ext] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404).end("404");
  }
});

await build();
server.listen(PORT, () => console.log(`\n  ➜ Site local : http://localhost:${PORT}\n`));

let timer;
for (const dir of WATCHED) {
  if (!existsSync(dir)) continue;
  watch(dir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(build, 200);
  });
}
