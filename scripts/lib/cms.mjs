import YAML from "yaml";

/**
 * Génère la configuration de Decap CMS (éditeur en ligne /admin/) à partir de
 * src/site.config.mjs : les catégories, types et difficultés sont ainsi définis
 * à un seul endroit et restent synchronisés avec les filtres du site.
 */
export function buildCmsConfig(config, siteUrl) {
  const p = (x) => [config.cms.subdir, x].filter(Boolean).join("/");
  const opts = (obj) => Object.entries(obj).map(([value, v]) => ({ label: v.label, value }));

  const typeOptions = Object.values(config.categories).flatMap((c) => c.types.map((t) => ({ label: `${c.label} · ${t}`, value: t })));

  const guideFields = [
    { label: "Titre", name: "title", widget: "string", hint: "Commence par « Comment… » (ex. « Comment réparer une chambre à air »)." },
    { label: "Auteur·e", name: "author", widget: "string", hint: "Ton prénom + initiale du nom, ou « L'équipe Repair n' Learn »." },
    { label: "Date de publication", name: "date", widget: "datetime", format: "YYYY-MM-DD", date_format: "YYYY-MM-DD", time_format: false, picker_utc: false },
    { label: "Catégorie", name: "category", widget: "select", options: opts(config.categories) },
    {
      label: "Types (filtres)",
      name: "types",
      widget: "select",
      multiple: true,
      min: 1,
      options: typeOptions,
      hint: "Choisis le type d'objet ou le logiciel concerné. Il doit correspondre à la catégorie.",
    },
    { label: "Difficulté", name: "difficulty", widget: "select", options: opts(config.difficulties), default: "facile" },
    { label: "Durée estimée", name: "duration", widget: "string", required: false, hint: "Ex. « 30 min »" },
    { label: "Résumé", name: "summary", widget: "text", hint: "1 à 2 phrases (≈ 180 caractères max) affichées dans la liste des guides." },
    { label: "Image de couverture", name: "cover", widget: "image", required: false, choose_url: false },
    { label: "Description de l'image", name: "cover_alt", widget: "string", required: false, hint: "Décris l'image pour les personnes malvoyantes." },
    {
      label: "Matériel & prérequis",
      name: "materials",
      widget: "list",
      required: false,
      hint: "Un élément par ligne : outils, pièces, logiciels nécessaires.",
    },
    {
      label: "Contenu",
      name: "body",
      widget: "markdown",
      hint: "Écris une courte introduction, puis un titre de niveau 2 (## ) par étape : chaque titre devient une étape numérotée. Ajoute des images avec le bouton « image ». Les encadrés s'écrivent « > [!TIP] », « > [!WARNING] » ou « > [!NOTE] ».",
    },
  ];

  const eventFields = [
    { label: "Titre", name: "title", widget: "string" },
    { label: "Type", name: "type", widget: "select", options: opts(config.eventTypes) },
    { label: "Début", name: "start", widget: "datetime", format: "YYYY-MM-DD HH:mm", date_format: "YYYY-MM-DD", time_format: "HH:mm", picker_utc: false },
    { label: "Fin", name: "end", widget: "datetime", format: "YYYY-MM-DD HH:mm", date_format: "YYYY-MM-DD", time_format: "HH:mm", picker_utc: false, required: false, hint: "Heure de Paris. Par défaut : début + 2 h." },
    { label: "Lieu", name: "location", widget: "string", hint: "Ex. « Fablab de l'école »" },
    { label: "Adresse", name: "address", widget: "string", required: false },
    { label: "Image", name: "image", widget: "image", required: false, choose_url: false },
    { label: "Description de l'image", name: "image_alt", widget: "string", required: false },
    { label: "Résumé", name: "summary", widget: "text", hint: "Une phrase qui donne envie, visible sur les cartes." },
    { label: "Prix", name: "price", widget: "string", default: "Gratuit" },
    { label: "Lien d'inscription", name: "registration_url", widget: "string", required: false },
    { label: "Description détaillée", name: "body", widget: "markdown", required: false },
  ];

  return {
    backend: { name: "github", repo: config.cms.repo, branch: config.cms.branch },
    publish_mode: "editorial_workflow",
    locale: "fr",
    site_url: siteUrl,
    display_url: siteUrl,
    logo_url: new URL("/icon-192.png", siteUrl).href,
    slug: { encoding: "ascii", clean_accents: true, sanitize_replacement: "-" },
    media_folder: p("public/uploads"),
    public_folder: "/uploads",
    collections: [
      {
        name: "guides",
        label: "Guides",
        label_singular: "Guide",
        folder: p("content/guides"),
        create: true,
        extension: "md",
        format: "frontmatter",
        slug: "{{slug}}",
        media_folder: p("public/uploads/guides"),
        public_folder: "/uploads/guides",
        summary: "{{title}} — {{author}}",
        sortable_fields: ["date", "title"],
        fields: guideFields,
      },
      {
        name: "events",
        label: "Rendez-vous",
        label_singular: "Rendez-vous",
        folder: p("content/events"),
        create: true,
        extension: "md",
        format: "frontmatter",
        slug: "{{year}}-{{month}}-{{day}}-{{slug}}",
        media_folder: p("public/uploads/events"),
        public_folder: "/uploads/events",
        summary: "{{start}} — {{title}}",
        sortable_fields: ["start", "title"],
        fields: eventFields,
      },
      {
        name: "pages",
        label: "Pages",
        files: [
          {
            name: "about",
            label: "À propos",
            file: p("content/about.md"),
            fields: [
              { label: "Surtitre", name: "eyebrow", widget: "string", required: false },
              { label: "Titre", name: "title", widget: "string" },
              { label: "Introduction", name: "intro", widget: "text" },
              {
                label: "Frise (étapes du projet)",
                name: "timeline",
                widget: "list",
                required: false,
                fields: [
                  { label: "Repère (date ou mot-clé)", name: "label", widget: "string", required: false },
                  { label: "Titre", name: "title", widget: "string" },
                  { label: "Texte", name: "text", widget: "text" },
                ],
              },
              {
                label: "Valeurs",
                name: "values",
                widget: "list",
                required: false,
                fields: [
                  {
                    label: "Icône",
                    name: "icon",
                    widget: "select",
                    options: ["recycle", "graduation-cap", "git-branch", "coffee", "heart", "wrench", "users", "leaf", "sparkles", "lightbulb", "hand-heart", "heart-handshake"],
                  },
                  { label: "Titre", name: "title", widget: "string" },
                  { label: "Texte", name: "text", widget: "text" },
                ],
              },
              { label: "Texte principal", name: "body", widget: "markdown" },
            ],
          },
        ],
      },
    ],
  };
}

export const cmsConfigYaml = (config, siteUrl) => YAML.stringify(buildCmsConfig(config, siteUrl), { lineWidth: 0 });
