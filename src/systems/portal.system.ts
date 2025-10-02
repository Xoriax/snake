import type { GameState } from "../core/state";

export function portalTeleportIfNeeded(s: GameState, x: number, y: number) {
    if (!s.portalsEnabled || !(s.portalA && s.portalB)) return { x, y, used: false };
    const A = s.portalA, B = s.portalB;
    if (A.x === x && A.y === y) { s.events.emit({ type: "portal" }); return { x: B.x, y: B.y, used: true }; }
    if (B.x === x && B.y === y) { s.events.emit({ type: "portal" }); return { x: A.x, y: A.y, used: true }; }
    return { x, y, used: false };
}