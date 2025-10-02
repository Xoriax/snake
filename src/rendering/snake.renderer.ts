import type { GameState } from "../core/state";
import { themeAt } from "./theme";

export function drawSnake(s: GameState, ctx: CanvasRenderingContext2D, themeIndex: number) {
    const t = themeAt(themeIndex);
    const ox = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;
    const oy = s.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;

    ctx.fillStyle = t.snake;
    for (let i = 0; i < s.snake.length - 1; i++) {
        const c = s.snake[i];
        ctx.fillRect(s.offX + c.x * s.cellSize + 1 + ox, s.offY + c.y * s.cellSize + 1 + oy, s.cellSize - 2, s.cellSize - 2);
    }
    const head = s.snake[s.snake.length - 1];
    ctx.fillStyle = t.head;
    ctx.fillRect(s.offX + head.x * s.cellSize + 1 + ox, s.offY + head.y * s.cellSize + 1 + oy, s.cellSize - 2, s.cellSize - 2);
}