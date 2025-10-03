import type { GameState } from "../core/state";
import { random, randomFreeCell } from "../core/state";

/** Durée entre deux déplacements automatiques des portails. */
const PORTAL_CYCLE_MS = 3000;

/**
 * Petit stockage du timer par partie sans toucher au type GameState.
 * (évite de modifier core/state.ts)
 */
const cycleTimer = new WeakMap<GameState, number>();

/** Fait tourner l'animation visuelle des portails. */
export function tickPortalPhase(s: GameState, dt: number) {
    if (!s.portalsEnabled) return;
    s.portalPhase = (s.portalPhase + dt * 0.006) % (Math.PI * 2);
}

/** À appeler au démarrage d'une partie : garantit une paire + initialise le timer. */
export function ensureInitialPortals(s: GameState) {
    if (!s.portalsEnabled) return;
    if (!s.portalA || !s.portalB) spawnPair(s);
    cycleTimer.set(s, PORTAL_CYCLE_MS);
}

/**
 * À appeler à chaque frame : décompte, et toutes les 3s,
 * on déplace la paire de portails (même si elle existe déjà).
 */
export function tickPortalCycle(s: GameState, dt: number) {
    if (!s.portalsEnabled) return;

    let t = cycleTimer.get(s);
    if (t == null) {
        // pas encore initialisé (sécurité si start() l'a oublié)
        ensureInitialPortals(s);
        t = cycleTimer.get(s) ?? PORTAL_CYCLE_MS;
    }

    t -= dt;
    if (t <= 0) {
        // Nouvelle paire ailleurs sur la grille
        spawnPair(s);
        t = PORTAL_CYCLE_MS;
    }
    cycleTimer.set(s, t);
}

/** Utilisé quand on veut (re)créer une paire uniquement s'il n'y en a pas. */
export function maybeRespawnPortals(s: GameState) {
    if (!s.portalsEnabled) return;
    if (!s.portalA || !s.portalB) spawnPair(s);
}

/** Place A et B sur des cases libres et différentes. */
function spawnPair(s: GameState) {
    s.portalA = randomFreeCell(s);
    do {
        s.portalB = randomFreeCell(s);
    } while (s.portalB.x === s.portalA.x && s.portalB.y === s.portalA.y);
}