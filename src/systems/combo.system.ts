import type { GameState } from "../core/state";
export function tickCombo(s: GameState, dt: number) {
    if (s.combo > 1) {
        s.comboTimerMs -= dt;
        if (s.comboTimerMs <= 0) { s.combo = 1; s.comboTimerMs = 0; }
    }
}