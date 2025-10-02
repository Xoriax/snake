import type { GameState } from "../core/state";
export function tickParticles(s: GameState) {
    if (!s.particles.length) return;
    const f = 0.98;
    for (const p of s.particles) { p.x += p.vx; p.y += p.vy; p.vx *= f; p.vy *= f; p.life -= 16; p.a *= 0.97; }
    s.particles = s.particles.filter(p => p.life > 0 && p.a > 0.02);
    if (s.shakeMs > 0) s.shakeMs -= 16;
}