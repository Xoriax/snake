import type { GameState } from "../core/state";
import { inBounds } from "../core/grid";

const SHRINK_EVERY_MS = 12000; // 12 secondes entre chaque rétrécissement

export function tickShrink(s: GameState, dt: number) {
    if (!s.shrinkEnabled) return;

    // Shrink fonctionne avec des murs (wrap OFF). On désactive wrap si besoin.
    if (s.wrap) s.wrap = false;

    s.shrinkTimerMs += dt;

    const maxInset = Math.floor(s.grid / 2) - 2;
    if (s.shrinkInset >= maxInset) return; // déjà au max

    if (s.shrinkTimerMs >= SHRINK_EVERY_MS) {
        s.shrinkTimerMs = 0;
        s.shrinkInset++;

        const inset = s.shrinkInset;

        // 1) Si la tête est en dehors → mort
        const head = s.snake[s.snake.length - 1];
        if (!inBounds(head.x, head.y, s.grid, inset)) {
            s.alive = false;
            s.shakeMs = Math.max(s.shakeMs, 300);
            s.events.emit({ type: "die" });
            return;
        }

        // 2) Food : si hors zone, on la repositionne au prochain tick de spawn…
        // Ici on la ramène immédiatement au bord intérieur le plus proche pour feedback instantané.
        if (!inBounds(s.food.x, s.food.y, s.grid, inset)) {
            clampCellIntoArena(s, s.food, inset);
        }

        // 3) Portails : s’ils sortent, on les annule (la logique de respawn/cycle gérera leur retour)
        if (s.portalA && !inBounds(s.portalA.x, s.portalA.y, s.grid, inset)) s.portalA = null;
        if (s.portalB && !inBounds(s.portalB.x, s.portalB.y, s.grid, inset)) s.portalB = null;

        // 4) Obstacles : on enlève ceux qui sont hors zone
        if (s.obstaclesEnabled && s.obstacles.length) {
            s.obstacles = s.obstacles.filter(o => inBounds(o.x, o.y, s.grid, inset));
        }
    }
}

/** Ramène la cellule 'c' dans la zone autorisée (in-place). */
function clampCellIntoArena(s: GameState, c: { x: number; y: number }, inset: number) {
    const min = inset;
    const max = s.grid - 1 - inset;
    if (c.x < min) c.x = min;
    if (c.y < min) c.y = min;
    if (c.x > max) c.x = max;
    if (c.y > max) c.y = max;
}