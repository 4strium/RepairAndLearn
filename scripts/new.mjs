#!/usr/bin/env node
/**
 * Crée un squelette de guide ou de rendez-vous.
 *
 *     npm run new:guide -- "Comment réparer une fermeture éclair"
 *     npm run new:event -- "Repair café de mars" 2027-03-13
 */
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { slugify } from "./lib/utils.mjs";

const [kind, title, dateArg] = process.argv.slice(2);
if (!["guide", "event"].includes(kind) || !title) {
  console.error('Usage :\n  npm run new:guide -- "Titre du guide"\n  npm run new:event -- "Titre" AAAA-MM-JJ');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const q = (s) => JSON.stringify(s);

let file;
let content;
if (kind === "guide") {
  file = path.join("content/guides", `${slugify(title)}.md`);
  content = `---
title: ${q(title)}
author: "Prénom N."
date: ${q(today)}
category: repair          # repair | open-source
types: []                 # ex. [Vélo] ou [Linux] — voir les types dans src/site.config.mjs
difficulty: facile        # facile | moyen | difficile
duration: "30 min"
summary: "Une ou deux phrases qui donnent envie de lire le guide."
# cover: /uploads/guides/mon-image.jpg
# cover_alt: "Description de l'image"
materials:
  - Premier outil ou prérequis
  - Deuxième outil ou prérequis
---
Courte introduction : à quoi sert ce guide, pour qui, et ce qu'on obtient à la fin.

## Première étape

Explique ce qu'il faut faire. Ajoute une image :

![Description de l'image](/uploads/guides/mon-image.jpg "Légende facultative")

> [!TIP]
> Un conseil pratique.

## Deuxième étape

Continue étape par étape. Chaque titre de niveau 2 devient une étape numérotée.

> [!WARNING]
> Un point de sécurité ou une erreur courante à éviter.

## Pour aller plus loin

- Un lien, une ressource, ou une invitation à venir au repair café.
`;
} else {
  const date = dateArg ?? today;
  file = path.join("content/events", `${date}-${slugify(title)}.md`);
  content = `---
title: ${q(title)}
type: repair-cafe         # repair-cafe | open-source
start: ${q(`${date} 14:00`)}   # heure de Paris
end: ${q(`${date} 18:00`)}
location: "Nom du lieu"
address: "Adresse complète"
# image: /uploads/events/mon-image.jpg
# image_alt: "Description de l'image"
summary: "Une phrase qui donne envie de venir."
price: Gratuit
# registration_url: https://…
---
Description détaillée : programme, ce qu'il faut apporter, infos pratiques…
`;
}

if (existsSync(file)) {
  console.error(`✖ ${file} existe déjà.`);
  process.exit(1);
}
await writeFile(file, content);
console.log(`✔ Créé : ${file}`);
