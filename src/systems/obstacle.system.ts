import type { GameState } from "../core/state";
import { randomFreeCell } from "../core/state";
export function ensureObstacles(s: GameState) {
    if (!s.obstaclesEnabled) return;
    if (s.obstacles.length === 0) {
        const base = s.mode === "hardcore" ? 16 : 10;
        for (let i = 0; i < base; i++) s.obstacles.push(randomFreeCell(s));
    }
}