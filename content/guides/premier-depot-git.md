---
# ✏️ Guide d'exemple : à relire, corriger et remplacer les images par vos propres photos.
title: Premiers pas avec Git et GitHub
author: L'équipe Repair n' Learn
date: "2026-10-19"
category: open-source
types: [Développement]
difficulty: moyen
duration: 45 min
summary: "Installer Git, créer ton premier dépôt et l'envoyer sur GitHub : les bases pour ne plus jamais perdre une version de ton code."
cover: /uploads/guides/premier-depot-git-cover.svg
cover_alt: Illustration de branches Git
materials:
  - Git installé (git-scm.com)
  - Un compte GitHub gratuit
  - Un terminal (PowerShell, Terminal, ou n'importe quel shell Linux)
  - Un éditeur de texte
---
**Git** est un logiciel libre qui garde l'historique de tes fichiers : tu peux revenir en arrière, travailler à plusieurs et tester des idées sans rien casser. **GitHub** est un service en ligne pour héberger tes dépôts Git et collaborer. Voici comment démarrer en quelques commandes.

## Installer et configurer Git

Télécharge Git depuis [git-scm.com](https://git-scm.com) (ou via ton gestionnaire de paquets sous Linux), puis vérifie l'installation dans un terminal :

```bash
git --version
```

Dis ensuite à Git qui tu es. Ces informations apparaîtront dans chacun de tes *commits* :

```bash
git config --global user.name "Prénom Nom"
git config --global user.email "ton.email@exemple.fr"
git config --global init.defaultBranch main
```

## Créer un dépôt

Crée un dossier pour ton projet et initialise Git à l'intérieur :

```bash
mkdir mon-projet
cd mon-projet
git init
```

![Terminal avec les premières commandes Git](/uploads/guides/premier-depot-git-1.svg "Un dépôt local, prêt à enregistrer ton travail.")

## Faire un premier commit

Crée un fichier, puis demande à Git de l'enregistrer :

```bash
echo "# Mon projet" > README.md
git status
git add README.md
git commit -m "Premier commit"
```

`git add` prépare les fichiers à enregistrer, `git commit` crée un point de sauvegarde accompagné d'un message. Prends l'habitude d'écrire des messages clairs : tu te remercieras plus tard.

## Créer le dépôt sur GitHub

Sur [github.com](https://github.com), clique sur **New repository**, donne-lui le même nom (`mon-projet`) et **ne coche pas** l'ajout d'un README (tu en as déjà un). Copie ensuite l'adresse du dépôt qui s'affiche.

## Envoyer ton travail

Relie ton dépôt local au dépôt GitHub, puis envoie ton historique :

```bash
git remote add origin https://github.com/TON-PSEUDO/mon-projet.git
git push -u origin main
```

> [!NOTE]
> GitHub n'accepte plus les mots de passe classiques pour les opérations Git. Au moment du `push`, utilise le gestionnaire d'identifiants fourni avec Git, un *token d'accès personnel*, ou une clé SSH. L'outil en ligne de commande `gh` simplifie beaucoup la connexion.

## Le cycle de tous les jours

Une fois le dépôt en place, ton quotidien se résume à ces quatre gestes :

```bash
git status                       # que s'est-il passé ?
git add .                        # préparer les modifications
git commit -m "Ce que j'ai fait" # enregistrer
git push                         # envoyer sur GitHub
```

## Pour aller plus loin

- Apprends à créer des **branches** (`git switch -c ma-branche`) pour tester sans risque.
- Contribue à un projet open source : fais un *fork*, une modification, puis une *pull request*.
- Viens à notre atelier Git pour pratiquer avec nous.
