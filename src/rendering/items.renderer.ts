import type { GameState } from "../core/state";
import { themeAt } from "./theme";

export function drawFoodAndPower(s: GameState, ctx: CanvasRenderingContext2D, themeIndex: number) {
    const t = themeAt(themeIndex);
    const ox = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;
    const oy = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;

    // food
    ctx.fillStyle = t.food;
    ctx.fillRect(s.offX + s.food.x * s.cellSize + 1 + ox, s.offY + s.food.y * s.cellSize + 1 + oy, s.cellSize - 2, s.cellSize - 2);

    // obstacles
    if (s.obstaclesEnabled) {
        ctx.fillStyle = t.obstacle;
        for (const o of s.obstacles)
            ctx.fillRect(s.offX + o.x * s.cellSize + 1 + ox, s.offY + o.y * s.cellSize + 1 + oy, s.cellSize - 2, s.cellSize - 2);
    }

    // power-up (icône)
    if (s.powerSpawn) {
        const { x, y } = s.powerSpawn.pos;
        const icon = s.powerSpawn.type === "slow" ? "⏳"
            : s.powerSpawn.type === "ghost" ? "👻"
                : s.powerSpawn.type === "x2" ? "x2"
                    : s.powerSpawn.type === "magnet" ? "🧲" : "⇄";
        ctx.fillStyle = t.powerup;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const fontSize = Math.floor(s.cellSize * (s.powerSpawn.type === "x2" ? 0.55 : 0.7));
        ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, Apple Color Emoji, Segoe UI Emoji, Arial`;
        ctx.fillText(icon, s.offX + x * s.cellSize + s.cellSize / 2 + ox, s.offY + y * s.cellSize + s.cellSize / 2 + oy);
    }
}