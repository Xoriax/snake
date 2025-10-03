import type { GameState } from "../core/state";
import { inBounds } from "../core/grid";

export function checkWallsOrWrap(s: GameState, nx: number, ny: number) {
    const inset = s.shrinkEnabled ? s.shrinkInset : 0;

    if (s.wrap && !s.shrinkEnabled) {
        nx = (nx + s.grid) % s.grid;
        ny = (ny + s.grid) % s.grid;
        return { dead: false, nx, ny };
    }

    if (!inBounds(nx, ny, s.grid, inset)) {
        return { dead: true, nx, ny };
    }
    return { dead: false, nx, ny };
}

export function collideAt(s: GameState, x: number, y: number) {
    const hitObstacle = s.obstaclesEnabled && s.obstacles.some(o => o.x === x && o.y === y);
    const hitSelf = s.snake.some(c => c.x === x && c.y === y) && s.power?.type !== "ghost";
    return hitObstacle || hitSelf;
}