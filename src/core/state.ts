import type { ActivePower, Cell, Mode, Options, PowerSpawn, Services } from "./types";
import { RNG, todaySeed } from "./rng";
import { EventBus } from "./events";
import { inBounds } from "./grid";

export type GameState = {
    grid: number;
    cellSize: number;
    offX: number; offY: number;

    mode: Mode;
    seeded: boolean;

    snake: Cell[];
    dir: "up" | "down" | "left" | "right";
    food: Cell;
    obstacles: Cell[];
    portalA: Cell | null;
    portalB: Cell | null;

    portalsEnabled: boolean;
    obstaclesEnabled: boolean;
    wrap: boolean;
    particlesEnabled: boolean;

    power: ActivePower | null;
    powerSpawn: PowerSpawn | null;

    baseStep: number;
    stepMs: number;
    accumulator: number;
    timeLimitMs: number | null;
    timeLeftMs: number | null;

    dashEnabled: boolean;
    dashCooldownMs: number;
    dashLeftMs: number;

    combo: number;
    comboTimerMs: number;

    shrinkEnabled: boolean;
    shrinkInset: number;
    shrinkTimerMs: number;

    portalPhase: number;
    particles: { x: number; y: number; vx: number; vy: number; a: number; life: number; color: string }[];
    shakeMs: number;

    alive: boolean;
    paused: boolean;
    score: number;
    best: number;

    rng: RNG | null;
    events: EventBus;
    services: Services;
};

export function createState(canvas: HTMLCanvasElement, best: number, services: Services, opts: Options): GameState {
    const grid = opts.grid ?? 24;
    const size = Math.min(canvas.width, canvas.height);
    const cellSize = Math.floor(size / grid);
    const board = cellSize * grid;
    const offX = Math.floor((canvas.width - board) / 2);
    const offY = Math.floor((canvas.height - board) / 2);

    const s: GameState = {
        grid, cellSize, offX, offY,
        mode: opts.mode, seeded: !!opts.seeded,

        snake: [], dir: "right",
        food: { x: 10, y: 10 },
        obstacles: [],
        portalA: null, portalB: null,

        portalsEnabled: !!opts.portals,
        obstaclesEnabled: false,
        wrap: false,
        particlesEnabled: !!opts.particles,

        power: null, powerSpawn: null,

        baseStep: 140, stepMs: 140, accumulator: 0,
        timeLimitMs: null, timeLeftMs: null,

        dashEnabled: !!opts.dash,
        dashCooldownMs: (opts.dashCooldownSec ?? 5) * 1000,
        dashLeftMs: 0,

        combo: 1, comboTimerMs: 0,

        shrinkEnabled: !!opts.shrinkArena,
        shrinkInset: 0,
        shrinkTimerMs: 0,

        portalPhase: 0,
        particles: [],
        shakeMs: 0,

        alive: true, paused: false, score: 0, best,

        rng: opts.seeded ? new RNG(todaySeed()) : null,
        events: new EventBus(),
        services,
    };

    // Mode
    if (s.mode === "classic") { s.baseStep = 140; s.stepMs = 140; s.wrap = false; s.obstaclesEnabled = false; }
    if (s.mode === "time") { s.baseStep = 130; s.stepMs = 130; s.wrap = false; s.obstaclesEnabled = false; s.timeLimitMs = 60_000; s.timeLeftMs = s.timeLimitMs; }
    if (s.mode === "zen") { s.baseStep = 160; s.stepMs = 160; s.wrap = true; s.obstaclesEnabled = false; }
    if (s.mode === "hardcore") { s.baseStep = 110; s.stepMs = 110; s.wrap = false; s.obstaclesEnabled = true; }

    // Si shrink est actif → wrap OFF, murs d'arène avec limites rétrécies
    if (s.shrinkEnabled) {
        s.wrap = false;
    }

    // Snake initial
    const cx = Math.floor(grid / 2), cy = Math.floor(grid / 2);
    s.snake = [{ x: cx - 1, y: cy }, { x: cx, y: cy }, { x: cx + 1, y: cy }];

    // Food initial (dans la zone autorisée)
    s.food = randomFreeCell(s);

    // Obstacles init si besoin
    if (s.obstaclesEnabled) {
        const base = s.mode === "hardcore" ? 16 : 10;
        for (let i = 0; i < base; i++) s.obstacles.push(randomFreeCell(s));
    }

    return s;
}

export function random(s: GameState) { return s.rng ? s.rng.next() : Math.random(); }
export function randint(s: GameState, max: number) { return Math.floor(random(s) * max); }

export function randomFreeCell(s: GameState): Cell {
    let c: Cell; let guard = 0;
    const inset = s.shrinkEnabled ? s.shrinkInset : 0;
    do {
        c = { x: randint(s, s.grid), y: randint(s, s.grid) };
        guard++; if (guard > 500) break;
    } while (
        s.snake.some(n => n.x === c.x && n.y === c.y) ||
        (s.obstaclesEnabled && s.obstacles.some(o => o.x === c.x && o.y === c.y)) ||
        (s.portalA && s.portalA.x === c.x && s.portalA.y === c.y) ||
        (s.portalB && s.portalB.x === c.x && s.portalB.y === c.y) ||
        (s.powerSpawn && s.powerSpawn.pos.x === c.x && s.powerSpawn.pos.y === c.y) ||
        (s.food.x === c.x && s.food.y === c.y) ||
        !inBounds(c.x, c.y, s.grid, inset)
    );
    return c;
}