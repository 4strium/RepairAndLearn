---
# ✏️ Guide d'exemple : à relire, corriger et remplacer les images par vos propres photos.
title: Comment installer Linux Mint sur un vieux PC
author: L'équipe Repair n' Learn
date: "2026-09-28"
category: open-source
types: [Linux]
difficulty: moyen
duration: 1 h
summary: Redonne un coup de jeune à un ordinateur lent avec Linux Mint, une distribution simple, gratuite et fluide.
cover: /uploads/guides/installer-linux-mint-cover.svg
cover_alt: Illustration d'une clé USB et d'un ordinateur
materials:
  - Un ordinateur à installer (idéalement 4 Go de RAM et 20 Go de disque libre)
  - Une clé USB de 8 Go minimum (elle sera entièrement effacée)
  - Une connexion Internet
  - Une sauvegarde de tes données importantes
  - Balena Etcher (Windows, macOS, Linux) ou Rufus (Windows)
---
**Linux Mint** est l'une des distributions Linux les plus accessibles pour débuter : son interface ressemble à celle d'un système classique, elle est fournie avec les logiciels de base, et elle tourne très bien sur des machines anciennes. Voyons comment l'installer pas à pas.

## Sauvegarder tes données

> [!WARNING]
> Une installation peut **effacer tout le contenu du disque**. Avant toute chose, copie tes documents, photos et mots de passe sur un disque externe ou un cloud. Mieux vaut une sauvegarde de trop que des souvenirs en moins.

## Télécharger Linux Mint

Rends-toi sur le site officiel [linuxmint.com](https://linuxmint.com/download.php) et télécharge l'image disque (fichier `.iso`) de l'édition **Cinnamon**, la plus populaire. Le fichier pèse environ 3 Go, laisse-lui un peu de temps.

> [!TIP]
> Pour être certain·e que le fichier n'est pas corrompu, le site propose une somme de contrôle (SHA256) à comparer avec celle de ton téléchargement. Étape facultative mais recommandée.

## Créer la clé USB d'installation

1. Branche la clé USB.
2. Lance **Balena Etcher**.
3. Clique sur *Flash from file* et choisis l'image `.iso` de Linux Mint.
4. Sélectionne ta clé USB avec *Select target* (vérifie bien que c'est la bonne !).
5. Clique sur *Flash!* et patiente jusqu'à la fin de la vérification.

![Création de la clé USB bootable](/uploads/guides/installer-linux-mint-1.svg "Étape clé : bien choisir la clé USB comme cible.")

## Démarrer l'ordinateur sur la clé

Laisse la clé branchée, redémarre le PC et appuie plusieurs fois sur la touche d'accès au **menu de démarrage** dès l'allumage. Selon le fabricant, c'est souvent `F12`, `F10`, `Échap` ou `F2`. Choisis ensuite ta clé USB dans la liste.

Un menu s'affiche : choisis *Start Linux Mint*. Le système se charge en quelques instants.

## Essayer avant d'installer

Tu es maintenant dans Linux Mint en mode « live » : rien n'est encore installé, aucune donnée n'est modifiée. Profites-en pour tester le Wi-Fi, le son, l'écran, le trackpad. Si tout fonctionne, tu peux passer à l'installation.

## Installer le système

1. Double-clique sur l'icône **Install Linux Mint** du bureau.
2. Choisis la langue, la disposition du clavier, et connecte-toi au Wi-Fi.
3. Coche l'installation des codecs multimédia (pour lire les vidéos et la musique).
4. À l'étape *Type d'installation* :
   - **Effacer le disque et installer Linux Mint** : le plus simple, mais tout est effacé.
   - **Autre chose** ou installation côte à côte : pour garder un autre système (réservé aux plus à l'aise).
5. Choisis ton fuseau horaire, ton nom d'utilisateur et un mot de passe.
6. Attends la fin de l'installation, puis clique sur *Redémarrer* et retire la clé quand on te le demande.

## Premiers réglages

Au premier démarrage, lance le **Gestionnaire de mises à jour** pour installer les correctifs, puis le **Gestionnaire de pilotes** au cas où une carte graphique ou Wi-Fi demande un pilote propriétaire. La **Logithèque** te permet ensuite d'installer des logiciels en un clic.

## Pour aller plus loin

- Découvre les équivalents libres de tes logiciels habituels : LibreOffice, Firefox, GIMP, VLC…
- Une difficulté pendant l'installation ? Viens à une de nos *install parties* : on installe ensemble.
- Pense à créer un point de restauration avec **Timeshift**, installé par défaut.
