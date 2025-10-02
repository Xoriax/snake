import type { GameState } from "../core/state";
import { stepOnce } from "./stepOnce";

export function tryDash(s: GameState) {
    if (!s.dashEnabled || !s.alive || s.paused) return;
    if (s.dashLeftMs > 0) return;
    stepOnce(s); // un step instantané
    if (s.alive) stepOnce(s);
    s.dashLeftMs = s.dashCooldownMs;
    s.shakeMs = Math.max(s.shakeMs, 120);
    s.events.emit({ type: "milestone", value: -1 }); // utilisé par audio pour jouer le son dash
}
export function tickDash(s: GameState, dt: number) { if (s.dashLeftMs > 0) s.dashLeftMs -= dt; }