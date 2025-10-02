# 🎮 Snake

Un **Snake en TypeScript avec Vite** comprenant de nombreuses fonctionnalités inédites pour se démarquer de la version classique.  
Ce projet est pensé pour être simple à installer, amusant à jouer et montrer mes compétences en **développement front-end (TypeScript/Canvas)**.

---

## ✨ Fonctionnalités

- 🐍 Gameplay
  - Déplacements fluides (ZQSD ou flèches)
  - Mort en touchant un mur ou soi-même
  - Portails animés 🌀
  - Dash ⚡ avec cooldown
  - Arène rétrécissante 🔥
  - Modes de jeu : Classic, Time Attack, Zen, Hardcore
  - Daily Challenge (seed du jour)

- 🎁 Power-ups
  - ⏳ Slow : ralentit le jeu
  - 👻 Ghost : traverse son corps
  - ✖️2 Score : double les points
  - 🧲 Magnet : attire la nourriture
  - ⇄ Mirror : inverse les contrôles

- 🎨 Design
  - Thèmes colorés néon / glacier / pastel dark
  - Particules et effets visuels
  - HUD complet (score, vitesse, combo, etc.)
  - Badges dynamiques pour les power-ups actifs

- 🔊 Audio
  - Sons générés avec WebAudio (eat, die, dash, portails, milestones)
  - Volume & mute réglables depuis le menu
  - Effets sonores différents selon l’action

---

## Architecture

Le code est organisé en architecture modulaire (ECS-lite) :

- `src/app/` – bootstrap, boucle de jeu, configuration
- `src/core/` – types, état, RNG, utilitaires, bus d’événements
- `src/systems/` – logique pure (mouvement, collisions, power-ups, dash, portails, etc.)
- `src/rendering/` – rendu Canvas (plateau, snake, items, portails, overlay)
- `src/ui/` – entrées clavier, HUD, menu, post-game, stockage local
- `src/audio/` – effets sonores (WebAudio)
- `src/features/` – fonctionnalités transverses (daily challenge…)
- `src/styles/` – styles CSS

Objectif : **responsabilités claires**, code testable et facile à faire évoluer.

---

## 🚀 Installation & Lancement

1. Clone le projet :
   ```bash
   git clone https://github.com/Xoriax/snake.git
   cd snake
