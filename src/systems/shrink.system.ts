import type { GameState } from "../core/state";
import { SHRINK_EVERY_MS } from "../app/config";
import { inBounds } from "../core/grid";

export function tickShrink(s: GameState, dt: number) {
    if (!s.shrinkEnabled || s.wrap) return;
    s.shrinkTimerMs += dt;
    const maxInset = Math.floor(s.grid / 2) - 2;
    if (s.shrinkTimerMs >= SHRINK_EVERY_MS && s.shrinkInset < maxInset) {
        s.shrinkInset++; s.shrinkTimerMs = 0;
        // si tête hors zone -> mort
        const head = s.snake[s.snake.length - 1];
        if (!inBounds(head.x, head.y, s.grid, s.shrinkInset)) { s.alive = false; s.events.emit({ type: "die" }); }
    }
}