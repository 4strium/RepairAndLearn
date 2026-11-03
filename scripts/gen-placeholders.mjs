/**
 * Génère des illustrations SVG « de remplacement » aux couleurs de la charte,
 * utilisées par les contenus d'exemple (public/uploads/…).
 *
 *     node scripts/gen-placeholders.mjs
 *
 * À remplacer par de vraies photos dès que possible.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { iconBody } from "./lib/icons.mjs";

const OUT = path.resolve("public/uploads");

const PAL = {
  repair: ["#A60321", "#D97B66"],
  os: ["#8C5C32", "#D9A577"],
  warm: ["#D97B66", "#D9A577"],
  step: ["#F2E9D8", "#F2E9D8"],
};

function svg({ w, h, palette, main, small, step = false }) {
  const [c1, c2] = PAL[palette];
  const iconColor = step ? "#A60321" : "#F2E9D8";
  const circle = step ? "#D97B66" : "#F2E9D8";
  const scale = (h * 0.5) / 24;
  const cx = w / 2 - (24 * scale) / 2;
  const cy = h / 2 - (24 * scale) / 2;
  const stroke = step ? 1.6 : 1.4;
  const smallIcon = small
    ? `<g transform="translate(${w * 0.68} ${h * 0.12}) scale(${scale * 0.38}) rotate(8 12 12)" fill="none" stroke="${step ? "#8C5C32" : "#D9A577"}" stroke-width="${stroke + 0.5}" stroke-linecap="round" stroke-linejoin="round">${iconBody(small)}</g>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${h * 0.012}" stdDeviation="${h * 0.012}" flood-color="#3A2411" flood-opacity="0.25"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="${step ? "#F2E9D8" : "url(#g)"}"/>
  <circle cx="${w * 0.12}" cy="${h * 0.15}" r="${h * 0.42}" fill="${circle}" opacity="${step ? 0.35 : 0.1}"/>
  <circle cx="${w * 0.92}" cy="${h * 0.95}" r="${h * 0.55}" fill="${circle}" opacity="${step ? 0.25 : 0.12}"/>
  <circle cx="${w * 0.78}" cy="${h * 0.2}" r="${h * 0.12}" fill="${circle}" opacity="${step ? 0.5 : 0.14}"/>
  <g filter="url(#s)">
    <g transform="translate(${cx} ${cy}) scale(${scale})" fill="none" stroke="${iconColor}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${iconBody(main)}</g>
    ${smallIcon}
  </g>
</svg>
`;
}

const items = [
  // Rendez-vous
  ["events/repair-cafe-novembre", { w: 1200, h: 630, palette: "repair", main: "wrench", small: "coffee" }],
  ["events/install-party-linux", { w: 1200, h: 630, palette: "os", main: "terminal", small: "laptop" }],
  ["events/repair-cafe-fetes", { w: 1200, h: 630, palette: "warm", main: "wrench", small: "party-popper" }],
  ["events/atelier-git", { w: 1200, h: 630, palette: "os", main: "git-branch", small: "terminal" }],
  // Couvertures de guides
  ["guides/reparer-chambre-a-air-velo-cover", { w: 1200, h: 630, palette: "repair", main: "bike", small: "wrench" }],
  ["guides/souder-un-fil-electrique-cover", { w: 1200, h: 630, palette: "repair", main: "zap", small: "cpu" }],
  ["guides/recoudre-un-bouton-cover", { w: 1200, h: 630, palette: "warm", main: "shirt", small: "scissors" }],
  ["guides/detartrer-une-bouilloire-cover", { w: 1200, h: 630, palette: "repair", main: "coffee", small: "droplets" }],
  ["guides/installer-linux-mint-cover", { w: 1200, h: 630, palette: "os", main: "laptop", small: "usb" }],
  ["guides/premier-depot-git-cover", { w: 1200, h: 630, palette: "os", main: "git-branch", small: "terminal" }],
  // Images d'étapes
  ["guides/reparer-chambre-a-air-velo-1", { w: 1200, h: 800, palette: "step", step: true, main: "bike", small: "wrench" }],
  ["guides/reparer-chambre-a-air-velo-2", { w: 1200, h: 800, palette: "step", step: true, main: "circle-check", small: "wrench" }],
  ["guides/souder-un-fil-electrique-1", { w: 1200, h: 800, palette: "step", step: true, main: "zap", small: "flame" }],
  ["guides/recoudre-un-bouton-1", { w: 1200, h: 800, palette: "step", step: true, main: "scissors", small: "shirt" }],
  ["guides/detartrer-une-bouilloire-1", { w: 1200, h: 800, palette: "step", step: true, main: "droplets", small: "coffee" }],
  ["guides/installer-linux-mint-1", { w: 1200, h: 800, palette: "step", step: true, main: "usb", small: "laptop" }],
  ["guides/premier-depot-git-1", { w: 1200, h: 800, palette: "step", step: true, main: "terminal", small: "git-branch" }],
];

for (const [name, opts] of items) {
  await writeFile(path.join(OUT, `${name}.svg`), svg(opts));
  console.log("✓", `uploads/${name}.svg`);
}
