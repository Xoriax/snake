import type { GameState } from "../core/state";
import { random, randomFreeCell } from "../core/state";
import { maybeRespawnPortals } from "./portal.spawn.system";

export function maybeMagnetFood(s: GameState) {
    if (s.power?.type !== "magnet") return;
    const head = s.snake[s.snake.length - 1];
    const dx = Math.sign(head.x - s.food.x);
    const dy = Math.sign(head.y - s.food.y);
    let nx = s.food.x, ny = s.food.y;
    if (Math.abs(head.x - s.food.x) >= Math.abs(head.y - s.food.y)) nx += dx;
    else ny += dy;

    const blocked =
        s.snake.some(c => c.x === nx && c.y === ny) ||
        (s.obstaclesEnabled && s.obstacles.some(o => o.x === nx && o.y === ny));
    if (!blocked) { s.food.x = nx; s.food.y = ny; }
}

export function onEat(s: GameState, hx: number, hy: number) {
    const base = s.power?.type === "x2" ? 2 : 1;
    s.score += base * s.combo;

    // combo & vitesse
    s.combo = Math.min(4, s.combo + 1);
    s.comboTimerMs = 4000;
    const level = Math.floor(s.score / 5);
    s.stepMs = Math.max(70, s.baseStep - level * 8);

    s.food = randomFreeCell(s);
    if (s.obstaclesEnabled && random(s) < 0.25) s.obstacles.push(randomFreeCell(s));

    // ⬇️ nouvelle ligne : si pas de portails à l’écran, on tente d’en créer
    maybeRespawnPortals(s);

    // particules
    s.particles.push(...spawnParticles(s, hx, hy, "#ff5b6e"));
}

function spawnParticles(s: GameState, cx: number, cy: number, color: string) {
    const out: typeof s.particles = [];
    for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.5 + Math.random() * 1.6;
        out.push({
            x: s.offX + cx * s.cellSize + s.cellSize / 2,
            y: s.offY + cy * s.cellSize + s.cellSize / 2,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            a: 1, life: 400 + Math.random() * 300, color
        });
    }
    return out;
}