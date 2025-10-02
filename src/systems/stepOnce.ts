import type { GameState } from "../core/state";
import { checkWallsOrWrap, collideAt } from "./collision.system";
import { portalTeleportIfNeeded } from "./portal.system";
import { onEat } from "./food.system";
import { tryPickPower } from "./powerup.system";

export function stepOnce(s: GameState) {
    const head = s.snake[s.snake.length - 1];
    let nx = head.x, ny = head.y;
    if (s.dir === "left") nx--; else if (s.dir === "right") nx++;
    else if (s.dir === "up") ny--; else ny++;

    const r = checkWallsOrWrap(s, nx, ny);
    if (r.dead) { s.alive = false; s.events.emit({ type: "die" }); return; }
    nx = r.nx; ny = r.ny;

    const tele = portalTeleportIfNeeded(s, nx, ny);
    nx = tele.x; ny = tele.y;

    if (collideAt(s, nx, ny)) { s.alive = false; s.events.emit({ type: "die" }); return; }
    s.snake.push({ x: nx, y: ny });

    // power
    tryPickPower(s, nx, ny);

    if (s.food.x === nx && s.food.y === ny) {
        onEat(s, nx, ny);
        s.events.emit({ type: "eat", x: nx, y: ny });
    } else {
        s.snake.shift();
    }
}