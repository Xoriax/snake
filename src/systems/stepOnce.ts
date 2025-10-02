import type { GameState } from "../core/state";
import { checkWallsOrWrap } from "./collision.system";
import { portalTeleportIfNeeded } from "./portal.system";
import { onEat } from "./food.system";
import { tryPickPower } from "./powerup.system";

export function stepOnce(s: GameState) {
    const head = s.snake[s.snake.length - 1];
    let nx = head.x, ny = head.y;

    if (s.dir === "left") nx--;
    else if (s.dir === "right") nx++;
    else if (s.dir === "up") ny--;
    else ny++;

    // Murs / wrap
    const r = checkWallsOrWrap(s, nx, ny);
    if (r.dead) { s.alive = false; s.events.emit({ type: "die" }); return; }
    nx = r.nx; ny = r.ny;

    // Portail
    const tele = portalTeleportIfNeeded(s, nx, ny);
    nx = tele.x; ny = tele.y;

    // Self/obstacles : autoriser la case de la queue si on NE MANGE PAS
    const tail = s.snake[0];
    const eating = (s.food.x === nx && s.food.y === ny);
    const movingIntoTail = (!eating && tail.x === nx && tail.y === ny);

    // obstacle ?
    const hitObstacle = s.obstaclesEnabled && s.obstacles.some(o => o.x === nx && o.y === ny);
    if (hitObstacle) { s.alive = false; s.events.emit({ type: "die" }); return; }

    // self ?
    const hitSelf = s.snake.some(c => c.x === nx && c.y === ny);
    if (hitSelf && !movingIntoTail && s.power?.type !== "ghost") {
        s.alive = false; s.events.emit({ type: "die" }); return;
    }

    // Avancer
    s.snake.push({ x: nx, y: ny });

    // Power-up ramassé ?
    tryPickPower(s, nx, ny);

    // Manger ?
    if (eating) {
        onEat(s, nx, ny);
        s.events.emit({ type: "eat", x: nx, y: ny });
    } else {
        // pas mangé → la queue part
        s.snake.shift();
    }
}