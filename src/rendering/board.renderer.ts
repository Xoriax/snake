import type { GameState } from "../core/state";
import { themeAt } from "./theme";

export function drawBoard(s: GameState, ctx: CanvasRenderingContext2D, themeIndex: number) {
    const t = themeAt(themeIndex);
    const ox = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;
    const oy = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;

    // Fond + grille
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = t.grid;
    for (let i = 0; i < s.grid; i++) {
        for (let j = 0; j < s.grid; j++) {
            ctx.fillRect(
                s.offX + i * s.cellSize + ox,
                s.offY + j * s.cellSize + oy,
                s.cellSize - 1,
                s.cellSize - 1
            );
        }
    }

    // Bordure de shrink (visible)
    if (s.shrinkEnabled && s.shrinkInset > 0) {
        ctx.strokeStyle = "#ffba3a";
        ctx.lineWidth = Math.max(2, s.cellSize * 0.1);
        const x = s.offX + s.shrinkInset * s.cellSize + 1 + ox;
        const y = s.offY + s.shrinkInset * s.cellSize + 1 + oy;
        const w = (s.grid - s.shrinkInset * 2) * s.cellSize - 2;
        ctx.strokeRect(x, y, w, w);
    }
}