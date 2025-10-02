import type { GameState } from "../core/state";
import type { Dir } from "../core/types";

export function applyDirection(s: GameState, proposed: Dir) {
    // mirror inverse ?
    const mirrored = s.power?.type === "mirror";
    const flip = (d: Dir): Dir => mirrored
        ? (d === "up" ? "down" : d === "down" ? "up" : d === "left" ? "right" : "left")
        : d;
    s.dir = flip(proposed);
}
export function nextHead(s: GameState) { // calcule la prochaine cellule tête
    const head = s.snake[s.snake.length - 1];
    let nx = head.x, ny = head.y;
    if (s.dir === "left") nx--;
    if (s.dir === "right") nx++;
    if (s.dir === "up") ny--;
    if (s.dir === "down") ny++;
    return { x: nx, y: ny };
}