import type { GameState } from "../core/state";
import { THEMES } from "../app/config";

export function drawOverlayIfNeeded(s: GameState, ctx: CanvasRenderingContext2D, themeIndex: number) {
    const t = THEMES[themeIndex];

    // Rien à dessiner si on joue normalement
    if (s.alive && !s.paused) return;

    // Fond assombri sur la zone du plateau
    const boardW = s.cellSize * s.grid;
    const boardH = s.cellSize * s.grid;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(s.offX, s.offY, boardW, boardH);

    // En PAUSE, on garde juste le libellé "PAUSE"
    if (s.paused && s.alive) {
        const cx = s.offX + boardW / 2;
        const cy = s.offY + boardH / 2;
        ctx.fillStyle = t.text;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 28px ui-sans-serif, system-ui, Arial";
        ctx.fillText("PAUSE", cx, cy);
    }
}