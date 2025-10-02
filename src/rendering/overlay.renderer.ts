import type { GameState } from "../core/state";
import { THEMES } from "../app/config";

export function drawOverlayIfNeeded(s: GameState, ctx: CanvasRenderingContext2D, themeIndex: number) {
    if (s.alive && !s.paused) return;
    const t = THEMES[themeIndex];
    const boardW = s.cellSize * s.grid;
    const boardH = s.cellSize * s.grid;
    const cx = s.offX + boardW / 2;
    const cy = s.offY + boardH / 2;

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(s.offX, s.offY, boardW, boardH);

    ctx.fillStyle = t.text;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (s.paused) {
        ctx.font = "bold 28px ui-sans-serif, system-ui, Arial";
        ctx.fillText("PAUSE", cx, cy - 10);
    } else {
        ctx.font = "bold 24px ui-sans-serif, system-ui, Arial";
        ctx.fillText(`Score : ${s.score}`, cx, cy - 14);
        ctx.font = "bold 18px ui-sans-serif, system-ui, Arial";
        ctx.fillText(`Meilleur : ${s.best}`, cx, cy + 12);
    }

    const line = "ZQSD • Espace: pause • R/↻: rejouer • F: dash • T: thème • W: wrap • O: obstacles";
    ctx.font = "13px ui-sans-serif, system-ui, Arial";
    ctx.fillText(line, cx, cy + 40);
}