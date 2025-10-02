import type { GameState } from "../core/state";
import type { Dir } from "../core/types";

const isOpposite = (a: Dir, b: Dir) =>
    (a === "left" && b === "right") ||
    (a === "right" && b === "left") ||
    (a === "up" && b === "down") ||
    (a === "down" && b === "up");

export function applyDirection(s: GameState, proposed: Dir) {
    // 1) Appliquer l'inversion si Mirror est actif
    const mirrored = s.power?.type === "mirror";
    const flip = (d: Dir): Dir =>
        mirrored
            ? d === "up" ? "down"
                : d === "down" ? "up"
                    : d === "left" ? "right"
                        : "left"
            : d;

    const candidate = flip(proposed);

    // 2) Filtrer le demi-tour APRÈS transformation (clé du bug)
    if (isOpposite(s.dir, candidate)) {
        // on ignore simplement ce changement de direction
        return;
    }

    s.dir = candidate;
}

// utilitaire facultatif (si tu l’utilises ailleurs)
export function nextHead(s: GameState) {
    const head = s.snake[s.snake.length - 1];
    let nx = head.x, ny = head.y;
    if (s.dir === "left") nx--;
    else if (s.dir === "right") nx++;
    else if (s.dir === "up") ny--;
    else ny++;
    return { x: nx, y: ny };
}