import type { GameState } from "../core/state";
import { random, randomFreeCell } from "../core/state";

export function tickPortalPhase(s: GameState, dt: number) {
    if (!s.portalsEnabled) return;
    s.portalPhase = (s.portalPhase + dt * 0.006) % (Math.PI * 2);
}

export function maybeRespawnPortals(s: GameState) {
    if (!s.portalsEnabled) return;
    if (random(s) < 0.35 && (!s.portalA || !s.portalB)) {
        s.portalA = randomFreeCell(s);
        do { s.portalB = randomFreeCell(s); } while (s.portalB.x === s.portalA.x && s.portalB.y === s.portalA.y);
    }
}