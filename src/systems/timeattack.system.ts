import type { GameState } from "../core/state";
export function tickTimeAttack(s: GameState, dt: number) {
    if (s.timeLeftMs === null) return;
    s.timeLeftMs -= dt;
    if (s.timeLeftMs <= 0) { s.timeLeftMs = 0; s.alive = false; s.events.emit({ type: "die" }); }
}