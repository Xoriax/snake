import type { GameState } from "../core/state";

function withAlpha(hex: string, a: number) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${a})`;
}

export function drawPortals(s: GameState, ctx: CanvasRenderingContext2D) {
    if (!(s.portalsEnabled && s.portalA && s.portalB)) return;
    _portal(ctx, s, s.portalA, "#7ad2ff");
    _portal(ctx, s, s.portalB, "#ff97e6");
}

function _portal(ctx: CanvasRenderingContext2D, s: GameState, cell: { x: number; y: number }, color: string) {
    const ox = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;
    const oy = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;

    const cx = s.offX + cell.x * s.cellSize + s.cellSize / 2 + ox;
    const cy = s.offY + cell.y * s.cellSize + s.cellSize / 2 + oy;
    const rOuter = s.cellSize * 0.48, rInner = s.cellSize * 0.26, phase = s.portalPhase;

    const grad = ctx.createRadialGradient(cx, cy, rInner * 0.2, cx, cy, rOuter);
    grad.addColorStop(0, withAlpha(color, 0.25));
    grad.addColorStop(1, withAlpha(color, 0.0));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, rOuter, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = withAlpha(color, 0.9);
    ctx.lineWidth = Math.max(2, s.cellSize * 0.12);
    ctx.beginPath(); ctx.arc(cx, cy, (rOuter + rInner) / 2, 0, Math.PI * 2); ctx.stroke();

    ctx.lineWidth = Math.max(1.2, s.cellSize * 0.07);
    const turns = 3;
    for (let i = 0; i < turns; i++) {
        const a0 = phase + i * (Math.PI * 2 / turns);
        const a1 = a0 + Math.PI * 1.15;
        ctx.strokeStyle = withAlpha(color, 0.85 - i * 0.18);
        ctx.beginPath(); ctx.arc(cx, cy, (rInner + rOuter) / 2 - i * (s.cellSize * 0.05), a0, a1); ctx.stroke();
    }

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath(); ctx.arc(cx, cy, rInner, 0, Math.PI * 2); ctx.fill();
}