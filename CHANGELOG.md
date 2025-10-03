# 📜 Changelog

Toutes les modifications notables de ce projet seront documentées ici.  
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),  
et ce projet suit [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.3.0] - 2025-10-03
### Ajouté
- 🌀 Portails dynamiques : la paire se **déplace automatiquement toutes les 3 secondes**.
- L'option *Portails* garantit une paire au démarrage.\n\n

---

## [1.2.2] - 2025-10-03
### Modifié
- Le screen shake est désormais **uniquement** déclenché à la mort (plus de shake pendant le dash).

---

## [1.2.1] - 2025-10-03
### Corrigé
- Portails: une paire est désormais générée au démarrage quand l'option est activée.
- Recréation possible après avoir mangé s'il n'y a pas de portails à l'écran.

---

## [1.2.0] - 2025-10-03
### Ajouté
- 🖼️ Refonte complète de la page d’accueil (design néon, glassmorphism)
- 🧩 Organisation en panneaux : Session, Gameplay, Power-ups, Audio
- 🧲 Switches custom, sélecteurs et slider stylés
- ▶️ Nouveau bouton **JOUER** (CTA) avec glow

### Modifié
- Mise en page responsive : grille 4 colonnes → 2 → 1 selon la largeur
- Harmonisation typographique et couleurs

---

## [1.1.2] - 2025-10-03
### Modifié
- Écran de fin : masque l’affichage du score/meilleur et affiche uniquement les boutons **Rejouer** / **Accueil** au centre du plateau.

---

## [1.1.1] - 2025-10-03
### Corrigé
- 🪞 Mirror: correction d’un 180° involontaire (filtrage après inversion)
- 🐍 (Optionnel) Entrée sur l’ancienne case de queue autorisée si on ne mange pas, pour éviter des morts injustes

---

## [1.1.0] - 2025-10-03
### Modifié
- 🔧 Restructuration complète en architecture modulaire (ECS-lite)
  - Séparation en `app/`, `core/`, `systems/`, `rendering/`, `ui/`, `audio/`, `features/`, `styles/`
  - Logiques isolées : mouvement, collisions, powerups, dash, portails, shrink, etc.
  - Code plus lisible et maintenable

### Ajouté
- 🧩 Mise à jour du README avec la section **Architecture**

---

## [1.0.0] - 2025-10-02

### Ajouté

- 🎮 Modes de jeu : Classic, Time Attack, Zen, Hardcore
- 🌀 Portails animés
- ⚡ Dash avec cooldown
- 🔥 Arène rétrécissante (Shrinking Arena)
- 🎁 Power-ups : ⏳ Slow, 👻 Ghost, ✖️2 Score, 🧲 Magnet, ⇄ Mirror
- 💡 Daily Challenge basé sur seed du jour
- 🔊 Sons dynamiques avec WebAudio
- ✨ HUD complet avec badges et thèmes (Néon, Glacier, Pastel)
- 💾 Sauvegarde du meilleur score avec localStorage

### Modifié

- Refonte complète du design (style arcade néon)

### Licence

- Ajout d’une licence MIT