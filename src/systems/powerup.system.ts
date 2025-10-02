import type { GameState } from "../core/state";
import { random, randomFreeCell } from "../core/state";

export function tickPowerTimers(s: GameState, dt: number) {
    if (s.power) { s.power.msLeft -= dt; if (s.power.msLeft <= 0) s.power = null; }
    if (!s.powerSpawn && s.mode !== "hardcore" && random(s) < 0.003) {
        const pool = ["slow", "ghost", "x2", "magnet", "mirror"] as const;
        const type = pool[Math.floor(random(s) * pool.length)];
        s.powerSpawn = { pos: randomFreeCell(s), type };
    }
}
export function tryPickPower(s: GameState, x: number, y: number) {
    if (!s.powerSpawn) return false;
    if (s.powerSpawn.pos.x === x && s.powerSpawn.pos.y === y) {
        const t = s.powerSpawn.type;
        const ms = t === "x2" ? 6000 : t === "magnet" ? 7000 : t === "mirror" ? 5000 : 5000;
        s.power = { type: t, msLeft: ms };
        s.powerSpawn = null;
        s.events.emit({ type: "power", power: t });
        return true;
    }
    return false;
}