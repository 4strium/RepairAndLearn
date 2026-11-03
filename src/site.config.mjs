/**
 * Configuration centrale du site.
 *
 * C'est ici (et dans le dossier content/) que l'on modifie les informations de
 * l'association : aucun besoin de toucher au code des pages.
 */
export default {
  name: "Repair n' Learn",
  tagline: "Repair café & open source",
  description:
    "Repair n' Learn est l'association étudiante qui répare des objets du quotidien lors de repair cafés et anime des interventions autour de l'open source.",

  // URL publique (utilisée pour les liens canoniques, le partage et le sitemap).
  // Sur Netlify, la variable d'environnement URL est utilisée en priorité.
  siteUrl: "https://repair-and-learn.netlify.app",

  locale: "fr-FR",
  timezone: "Europe/Paris",

  email: "repair-and-learn@etik.com",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61595739621512",
    instagram: "https://www.instagram.com/repair.and.learn/",
  },

  nav: [
    { label: "Accueil", href: "/" },
    { label: "Rendez-vous", href: "/rendez-vous/" },
    { label: "Guides", href: "/guides/" },
    { label: "À propos", href: "/a-propos/" },
  ],

  // Nombre d'éléments affichés sur la page d'accueil.
  homeEvents: 3,
  homeGuides: 3,

  /**
   * Catégories et types de guides (= filtres de la page Guides).
   * Pour ajouter un type d'objet ou de logiciel : l'ajouter dans la liste
   * `types` correspondante. Il apparaîtra automatiquement dans les filtres
   * ET dans le formulaire d'ajout de guide (/admin/).
   */
  categories: {
    repair: {
      label: "Réparation",
      icon: "wrench",
      typesLabel: "Type d'objet",
      types: [
        "Électroménager",
        "Vêtements & textile",
        "Vélo",
        "Informatique & téléphone",
        "Petit électronique",
        "Mobilier & bricolage",
      ],
    },
    "open-source": {
      label: "Open source",
      icon: "terminal",
      typesLabel: "Logiciel",
      types: ["Linux", "Bureautique", "Développement", "Création", "Sécurité & vie privée"],
    },
  },

  difficulties: {
    facile: { label: "Facile", level: 1 },
    moyen: { label: "Intermédiaire", level: 2 },
    difficile: { label: "Avancé", level: 3 },
  },

  eventTypes: {
    "repair-cafe": { label: "Repair café", icon: "wrench" },
    "open-source": { label: "Open source", icon: "terminal" },
  },

  /**
   * Éditeur en ligne des guides et rendez-vous (Decap CMS, page /admin/).
   * `repo`   : dépôt GitHub (propriétaire/nom).
   * `branch` : branche publiée par Netlify.
   * `subdir` : dossier du projet DANS le dépôt ("" si le site est à la racine).
   */
  cms: {
    repo: "4strium/RepairAndLearn",
    branch: "main",
    subdir: "",
  },

  /**
   * Commentaires des guides (Giscus = GitHub Discussions, gratuit, sans pub).
   * À remplir une fois sur https://giscus.app (voir README.md, section « Commentaires »).
   * Tant que ces champs sont vides, un message de repli est affiché.
   */
  giscus: {
    repo: "", // ex. "mon-asso/repair-and-learn"
    repoId: "",
    category: "Commentaires des guides",
    categoryId: "",
  },
};
