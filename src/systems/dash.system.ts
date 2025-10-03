import type { GameState } from "../core/state";
import { stepOnce } from "./stepOnce";

export function tryDash(s: GameState) {
    if (!s.dashEnabled || !s.alive || s.paused) return;
    if (s.dashLeftMs > 0) return;

    // Double step instantané (dash)
    stepOnce(s);
    if (s.alive) stepOnce(s);

    s.dashLeftMs = s.dashCooldownMs;

    // On garde l’event pour le son de dash
    s.events.emit({ type: "milestone", value: -1 });
}

export function tickDash(s: GameState, dt: number) {
    if (s.dashLeftMs > 0) s.dashLeftMs -= dt;
}