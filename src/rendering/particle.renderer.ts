import type { GameState } from "../core/state";
export function drawParticles(s: GameState, ctx: CanvasRenderingContext2D) {
    if (!s.particles.length) return;
    for (const p of s.particles) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
}