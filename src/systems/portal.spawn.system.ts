import type { GameState } from "../core/state";
import { random, randomFreeCell } from "../core/state";

/** Fait tourner l'animation de phase des portails. */
export function tickPortalPhase(s: GameState, dt: number) {
    if (!s.portalsEnabled) return;
    s.portalPhase = (s.portalPhase + dt * 0.006) % (Math.PI * 2);
}

/** Assure qu'une paire existe si l'option est cochée (appelé au démarrage). */
export function ensureInitialPortals(s: GameState) {
    if (!s.portalsEnabled) return;
    if (!s.portalA || !s.portalB) {
        spawnPair(s);
    }
}

/** Peut créer une paire lorsqu'il n'y en a pas (utilisé après avoir mangé). */
export function maybeRespawnPortals(s: GameState) {
    if (!s.portalsEnabled) return;
    if (!s.portalA || !s.portalB) {
        // probabilité raisonnable si on veut éviter l'apparition immédiate après chaque pomme
        if (random(s) < 0.35) spawnPair(s);
    }
}

function spawnPair(s: GameState) {
    s.portalA = randomFreeCell(s);
    do {
        s.portalB = randomFreeCell(s);
    } while (s.portalB.x === s.portalA.x && s.portalB.y === s.portalA.y);
}