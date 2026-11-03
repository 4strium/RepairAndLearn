# Repair n' Learn — documentation technique

Ce document explique comment installer le site, modifier son contenu ou son code, le tester et le publier. Le site est un générateur statique : les pages HTML sont fabriquées à partir de fichiers Markdown, de gabarits JavaScript et de ressources, puis publiées depuis `dist/`.

## Sommaire

- [Prérequis et installation](#prérequis-et-installation)
- [Développement local](#développement-local)
- [Organisation du projet](#organisation-du-projet)
- [Modifier le contenu](#modifier-le-contenu)
- [Modifier le site](#modifier-le-site)
- [Tester les changements](#tester-les-changements)
- [Déployer sur Netlify](#déployer-sur-netlify)
- [Éditeur en ligne /admin/](#éditeur-en-ligne-admin)
- [Fonctionnalités et services externes](#fonctionnalités-et-services-externes)
- [Problèmes fréquents](#problèmes-fréquents)

## Prérequis et installation

- **Node.js 20 ou supérieur** (Netlify est configuré pour Node 22 ; utiliser Node 22 localement est recommandé).
- **npm**, fourni avec Node.js.
- Git et un accès au dépôt GitHub pour contribuer ou publier.

Depuis le dossier `repair_and_learn` :

```sh
npm ci
npm run dev
```

Le site est alors disponible sur <http://localhost:8888>. Le serveur reconstruit le site après les modifications dans `src/`, `content/`, `public/` ou `scripts/`, puis recharge les pages. Arrêter le serveur avec `Ctrl+C`.

Pour choisir un autre port :

```sh
PORT=3000 npm run dev
```

`npm ci` installe les versions figées par `package-lock.json`. Après une modification volontaire des dépendances, utiliser `npm install` et versionner le manifeste ainsi que le lockfile.

## Développement local

### Générer le site sans le serveur de développement

```sh
npm run build
```

La commande efface puis recrée `dist/`. Ce répertoire est généré : ne pas y faire de modifications manuelles, elles seront perdues au prochain build. Il est ignoré par Git.

Pour examiner le résultat généré, lancer `npm run dev` ou utiliser un serveur HTTP statique sur `dist/`. L'ouverture directe des fichiers HTML (`file://`) n'est pas un test fiable pour les routes, les modules JavaScript ou les formulaires.

### Dates reproductibles

Les dates d'événements passés/futurs sont déterminées pendant le build. Pour reproduire un build à une date précise :

```sh
BUILD_NOW=2026-11-01T12:00:00Z npm run build
```

En développement, `URL` est réglée automatiquement sur l'URL locale. Pour un build manuel, `URL` peut remplacer l'URL de production utilisée pour les URL canoniques et le sitemap :

```sh
URL=https://exemple.netlify.app npm run build
```

## Organisation du projet

| Chemin | Rôle |
| --- | --- |
| `content/about.md` | Contenu de la page « À propos ». |
| `content/guides/*.md` | Guides publiés en Markdown avec métadonnées YAML. |
| `content/events/*.md` | Rendez-vous publiés en Markdown avec métadonnées YAML. |
| `src/site.config.mjs` | Configuration centrale : nom, URL, navigation, coordonnées, catégories, types, événements, CMS et commentaires. |
| `src/templates/` | Gabarits HTML générés pour les pages et composants. |
| `src/css/` | Feuilles de style (base, mise en page, composants, pages). Elles sont concaténées au build. |
| `src/js/` | JavaScript du navigateur : navigation, recherche/filtres, événements, guides et formulaire. |
| `scripts/build.mjs` | Génère toutes les pages et fichiers annexes dans `dist/`. |
| `scripts/dev.mjs` | Serveur local avec reconstruction et rechargement automatique. |
| `scripts/lib/` | Chargement du contenu, dates, images, CMS et utilitaires de build. |
| `scripts/new.mjs` | Générateur de squelettes de guides et de rendez-vous. |
| `public/` | Fichiers statiques copiés dans le site : icônes, manifeste, images et téléversements. |
| `public/uploads/` | Images utilisées dans les guides et rendez-vous. |
| `public/admin/` | Point d'entrée du CMS ; `admin/config.yml` est généré dans `dist/` au build. |
| `netlify.toml` | Commande de build, dossier publié, version de Node et en-têtes HTTP Netlify. |
| `dist/` | Résultat temporaire du build, publié par Netlify. |

Le build crée les routes de pages, `guides/search-index.json`, les fichiers calendrier `.ics` des événements à venir, `sitemap.xml`, `robots.txt` et la configuration du CMS. Les noms des fichiers CSS et JavaScript sont hachés pour permettre leur mise en cache longue durée.

## Modifier le contenu

Les fichiers de contenu peuvent être modifiés directement dans `content/` (puis commités) ou dans l'éditeur `/admin/` si celui-ci a été configuré et si l'utilisateur a les droits nécessaires.

### Ajouter un guide

Créer un squelette :

```sh
npm run new:guide -- "Comment réparer une fermeture éclair"
```

La commande crée `content/guides/<slug>.md`. Compléter son frontmatter YAML et remplacer tout le texte d'exemple. Structure usuelle :

```yaml
---
title: Comment réparer une fermeture éclair
author: Prénom N.
date: "2026-11-03"
category: repair
types: [Vêtements & textile]
difficulty: facile
duration: 30 min
summary: Une phrase claire qui décrit le résultat du guide.
cover: /uploads/guides/fermeture-eclair.jpg
cover_alt: Une fermeture éclair réparée
materials:
  - Une aiguille
  - Du fil adapté
---
Une courte introduction.

## Préparer le matériel

Décrire cette étape.

## Réparer la fermeture

Décrire la suite.

## Pour aller plus loin

Ajouter des ressources ou une conclusion.
```

Champs requis : `title`, `author`, `date`, `category`, `summary`. `category` vaut `repair` ou `open-source`. `difficulty` (facultatif) vaut `facile`, `moyen` ou `difficile`. Les types autorisés par catégorie figurent dans `src/site.config.mjs` ; les filtres de la page Guides et le formulaire CMS sont produits depuis cette configuration. Ajouter un type dans la bonne catégorie pour l'activer partout.

Chaque titre Markdown `##` devient une section du guide. Les sections ordinaires sont numérotées automatiquement ; les sections nommées « Conclusion », « Ressources », « Pour finir », « Et ensuite » ou « Pour aller plus loin » sont traitées comme des sections de fin, non numérotées. Les titres `###` restent des sous-sections d'une étape. Les matériaux sont une liste YAML. Un contenu peut être masqué du site en ajoutant `draft: true` au frontmatter.

Encadrés reconnus :

```md
> [!NOTE]
> Information complémentaire.

> [!TIP]
> Astuce pratique.

> [!IMPORTANT]
> Information importante.

> [!WARNING]
> Point de vigilance ou de sécurité.
```

### Ajouter un rendez-vous

Créer un squelette avec une date au format ISO `AAAA-MM-JJ` :

```sh
npm run new:event -- "Repair café de mars" 2027-03-13
```

La commande crée `content/events/2027-03-13-repair-cafe-de-mars.md`. Champs requis : `title`, `type`, `start`, `location`. Exemple de frontmatter :

```yaml
---
title: Repair café de mars
type: repair-cafe
start: "2027-03-13 14:00"
end: "2027-03-13 18:00"
location: Fablab de l'école
address: Adresse complète
image: /uploads/events/repair-cafe-mars.jpg
image_alt: Des bénévoles autour d'un établi
summary: Une phrase d'information pour la carte de l'événement.
price: Gratuit
registration_url: https://exemple.org/inscription
---
Description, programme et informations pratiques.
```

`type` doit être une clé de `eventTypes` dans `src/site.config.mjs` (`repair-cafe` ou `open-source`). Les heures sont saisies en heure de Paris, au format `AAAA-MM-JJ HH:mm`. Si `end` est omise, la durée par défaut est de deux heures. Les événements terminés apparaissent dans la liste des rendez-vous passés. Un fichier `.ics` est créé au build pour chaque rendez-vous encore à venir.

Les contenus avec `draft: true` sont ignorés par le build. Pour retirer un contenu, supprimer son fichier Markdown et les images qui ne sont plus utilisées après vérification des références.

### Modifier la page À propos

Modifier le frontmatter et le texte de `content/about.md`. Il contient notamment `eyebrow`, `title`, `intro`, `timeline`, `values` et `body`. Chaque entrée de `timeline` utilise `label`, `title`, `text` ; chaque valeur utilise `icon`, `title`, `text`.

### Ajouter ou remplacer des images

1. Placer les fichiers d'événement sous `public/uploads/events/` et les images de guide sous `public/uploads/guides/`.
2. Référencer l'image par son chemin public, par exemple `/uploads/guides/fermeture-eclair.jpg`.
3. Ajouter un texte alternatif descriptif dans `cover_alt` ou `image_alt` ; pour une image dans le Markdown, écrire `![Description](/uploads/guides/photo.jpg)`.

Les images raster (`jpg`, `jpeg`, `png`, `webp`) dans `public/uploads/` sont automatiquement redressées selon leur orientation, privées de métadonnées EXIF (dont la géolocalisation), limitées à 1600 px de large et recompressées. Les SVG sont copiés sans cette optimisation raster. Préférer des images optimisées et suffisamment légères ; ne pas déposer de secrets ou de données personnelles dans `public/`.

## Modifier le site

- **Textes globaux, coordonnées, URL, navigation, réseaux sociaux, filtres et CMS** : modifier `src/site.config.mjs`.
- **Structure ou balisage d'une page** : modifier le gabarit concerné sous `src/templates/`.
- **Style** : modifier la feuille correspondante sous `src/css/`. Les fichiers CSS sont assemblés dans l'ordre alphabétique ; les préfixes `01-`, `02-`, etc. matérialisent cet ordre.
- **Interactions navigateur** : modifier le module pertinent sous `src/js/`.
- **Icônes** : le projet utilise les icônes de `lucide-static` via `scripts/lib/icons.mjs`.
- **Logo, favicon, manifeste et images fixes** : modifier les éléments correspondants sous `public/` (et éventuellement les sources dans `brand/`).

Après une modification de la configuration, des gabarits ou des styles, examiner au minimum la page concernée et ses versions mobile et bureau. Pour une nouvelle catégorie, un nouveau type ou une nouvelle valeur de configuration, vérifier aussi les formulaires et filtres qui en dépendent.

### URL de production et domaine personnalisé

`src/site.config.mjs` contient une URL de repli. Sur Netlify, la variable d'environnement `URL` est utilisée en priorité pour les URL canoniques, les métadonnées de partage et le sitemap. Vérifier l'URL publiée et le domaine personnalisé dans les paramètres Netlify. En local, `npm run dev` utilise l'URL locale automatiquement.

## Tester les changements

### Vérification de build

```sh
npm run build
```

Un build réussi doit afficher `Site généré dans dist/` avec le nombre de rendez-vous et de guides. Cette commande valide le parsing des frontmatters, les champs obligatoires et plusieurs valeurs de configuration, puis génère les pages. Elle ne remplace pas une suite de tests navigateur.

Le projet ne définit actuellement **aucune commande de tests automatisés** (`npm test` n'est pas configuré). Avant une demande de fusion ou une publication, faire aussi les vérifications manuelles suivantes :

- Ouvrir l'accueil, les pages Guides, Rendez-vous, À propos et Contact ; vérifier l'absence d'erreurs visuelles.
- Ouvrir un guide et un événement ; vérifier titres, dates, images, liens et contenu Markdown.
- Tester recherche et filtres des guides, navigation mobile, menu, fenêtres de détail des rendez-vous et sommaire d'un guide.
- Tester au moins une largeur mobile et une largeur bureau ; vérifier qu'aucun contenu ne déborde.
- Vérifier les liens internes, liens externes, images, icônes et page 404 (par exemple `/adresse-inexistante`).
- Pour le formulaire, essayer une soumission invalide et une valide en local, puis tester prudemment sur le site publié.
- Vérifier sur Netlify les formulaires reçus et les journaux de déploiement après mise en production.

Le serveur local simule une réponse réussie pour tout POST et ne transmet **aucun** formulaire à Netlify. Une réussite locale ne prouve donc pas que la collecte Netlify Forms est correctement activée en production. De même, les commentaires GitHub ne s'afficheront que si Giscus est configuré.

## Déployer sur Netlify

Le fichier `netlify.toml` configure déjà :

- commande de build : `npm run build` ;
- dossier publié : `dist` ;
- Node.js 22 ;
- en-têtes de sécurité et de cache.

### Première configuration

1. Relier dans Netlify le dépôt GitHub qui contient le projet et autoriser l'accès au dépôt.
2. Vérifier que les paramètres de build affichent `npm run build` et `dist` (ils sont aussi déclarés dans `netlify.toml`).
3. Déployer la branche publiée, actuellement `main`, puis vérifier le résultat et l'URL Netlify.
4. Si un domaine personnalisé est ajouté, le configurer dans Netlify et vérifier HTTPS/DNS ainsi que l'URL canonique générée.
5. Configurer séparément l'authentification de `/admin/` si l'éditeur CMS doit être utilisé (voir la section suivante).

Une mise à jour de la branche publiée déclenche normalement un nouveau build et déploiement Netlify. Les demandes de fusion et branches de prévisualisation peuvent être utilisées pour contrôler le site avant publication, selon les réglages du site Netlify. Ne pas éditer `dist/` : Netlify le régénère à chaque déploiement.

### Après déploiement

- Vérifier le statut du build dans Netlify et ouvrir l'URL déployée.
- Parcourir les pages modifiées, notamment sur mobile.
- Vérifier `https://<domaine>/sitemap.xml`, `/robots.txt`, `/404.html` et les fichiers images.
- Vérifier le formulaire avec un message de test et confirmer sa réception dans la section Forms de Netlify ; supprimer ensuite ce message de test si nécessaire.
- Vérifier `/admin/` uniquement si l'authentification GitHub a été configurée.

`netlify.toml` définit des en-têtes HTTP et du cache : CSS/JS hachés en cache long, fichiers d'images et téléversements en cache plus court, et `/admin/` sans cache. Si l'hébergement est migré hors de Netlify, ces règles, la détection des formulaires et le processus de publication devront être adaptés à la nouvelle plateforme.

## Éditeur en ligne `/admin/`

Le CMS est **Decap CMS**. `public/admin/index.html` charge son interface ; `scripts/build.mjs` produit `dist/admin/config.yml` à partir de `src/site.config.mjs`. Il permet de modifier les guides, les rendez-vous et la page À propos, avec un flux éditorial (`editorial_workflow`). Les images téléversées sont déposées dans `public/uploads/` du dépôt.

Pour qu'il fonctionne en production, tous les éléments suivants doivent être réunis :

- `src/site.config.mjs` doit indiquer le bon `repo` GitHub, la bonne `branch` publiée et le bon `subdir` (chemin du projet dans le dépôt ; chaîne vide si le projet est à la racine).
- L'utilisateur doit avoir les permissions adéquates sur le dépôt.
- Un mécanisme OAuth compatible avec le backend GitHub de Decap doit être configuré pour ce déploiement. Cette configuration d'authentification n'est pas incluse dans les fichiers du projet ; la page `/admin/` seule ne donne pas accès au dépôt. Ne pas considérer le simple réglage `noindex` comme un contrôle d'accès.
- Les versions de branche/déploiement et les paramètres Netlify doivent permettre le flux de publication prévu. Avec `editorial_workflow`, les modifications peuvent passer par des brouillons/branches et doivent être publiées selon le processus configuré avant d'apparaître sur le site public.

En cas de déplacement du projet, synchroniser `cms.repo`, `cms.branch` et `cms.subdir` avec le dépôt réel, puis reconstruire et tester le CMS sur un déploiement de prévisualisation avant de l'annoncer aux contributeurs.

## Fonctionnalités et services externes

### Formulaire de contact

Le formulaire de `src/templates/contact.mjs` utilise Netlify Forms (`data-netlify="true"`) et une validation côté navigateur. Netlify détecte le formulaire au déploiement et stocke les soumissions dans l'administration Netlify. Le formulaire contient un champ honeypot ; ce mécanisme ne dispense pas de surveiller les soumissions indésirables. Le serveur local ne fait qu'accuser réception et n'envoie pas les messages.

### Commentaires Giscus

Les commentaires des guides utilisent Giscus et GitHub Discussions, chargés à la demande. Les champs `repo`, `repoId` et `categoryId` de `giscus` dans `src/site.config.mjs` sont vides par défaut ; un texte de repli est donc affiché. Pour activer les commentaires :

1. Préparer un dépôt GitHub public avec Discussions activé et la catégorie de discussions souhaitée.
2. Récupérer les identifiants générés par <https://giscus.app> pour le dépôt et la catégorie.
3. Reporter `repo`, `repoId`, `category` et `categoryId` dans `src/site.config.mjs`.
4. Construire et tester une page guide publiée ; la saisie d'un commentaire nécessite un compte GitHub.

Giscus charge un script tiers depuis `giscus.app` lorsque le visiteur approche de la zone des commentaires. Si la confidentialité ou les scripts tiers ne sont pas souhaités, laisser la configuration vide.

### Dépendances

Les dépendances de build et du CMS sont déclarées dans `package.json` et verrouillées dans `package-lock.json`. `sharp` traite les images, `marked` le Markdown, `yaml` les frontmatters et `playwright-core` est disponible comme dépendance mais aucun scénario de test Playwright n'est défini actuellement.

## Problèmes fréquents

| Symptôme | Vérifications |
| --- | --- |
| Le build échoue sur un champ manquant | Vérifier le frontmatter YAML et les champs requis du type de contenu concerné. Le message d'erreur donne le fichier et les champs attendus. |
| Le build indique un YAML invalide | Vérifier les guillemets, les deux-points et l'indentation. Les dates et chaînes contenant une ponctuation ambiguë peuvent être mises entre guillemets. |
| Un type ou une catégorie est inconnu | Utiliser une clé existante dans `src/site.config.mjs` ; ajouter d'abord la nouvelle valeur dans cette configuration si nécessaire. |
| Une image ne s'affiche pas | Vérifier son chemin depuis `public/` : le fichier `public/uploads/guides/a.jpg` est référencé par `/uploads/guides/a.jpg`. Vérifier aussi casse et extension. |
| Le CMS affiche une erreur de configuration | Vérifier que le déploiement inclut `/admin/config.yml` et contrôler `repo`, `branch`, `subdir` ainsi que le fournisseur OAuth. |
| Les modifications de contenu n'apparaissent pas | Vérifier que le contenu a été publié/mergé dans la branche déployée et que le dernier build Netlify a réussi. Les brouillons sont volontairement exclus du site. |
| Un formulaire local semble envoyé mais rien n'arrive sur Netlify | C'est attendu : l'envoi local est simulé. Vérifier le déploiement Netlify, la détection du formulaire et l'onglet Forms. |
| Les URL canoniques ou le sitemap ont une mauvaise origine | Vérifier l'URL du site Netlify/domaine personnalisé et `src/site.config.mjs` ; sur Netlify, `URL` est prioritaire. |
| Le build échoue après une mise à jour de dépendances | Réinstaller avec `npm ci`, vérifier la version Node (20+ ; 22 recommandé), puis relancer `npm run build`. |
