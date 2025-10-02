import { saveBest } from "./storage";
import type { Dir } from "./input";

/** Interface SFX appelée par le jeu (implémentée côté main.ts) */
export interface Sfx {
    eat(): void; die(): void; power(): void; portal(): void; dash(): void; milestone(): void;
    setMuted?(m: boolean): void; setVolume?(v: number): void;
}

type Cell = { x: number; y: number };
type Theme = {
    bg: string; grid: string; snake: string; head: string;
    food: string; text: string; obstacle: string; powerup: string;
};
type PowerType = "slow" | "ghost" | "x2" | "magnet" | "mirror";
type ActivePower = { type: PowerType; msLeft: number };
type PowerSpawn = { pos: Cell; type: PowerType };

const THEMES: Theme[] = [
    { bg: "#0f1320", grid: "#1b2233", snake: "#58ffb3", head: "#a7ffea", food: "#ff5b6e", text: "#e8ecf1", obstacle: "#8c9db8", powerup: "#ffffff" },
    { bg: "#101418", grid: "#1a232c", snake: "#9dd6ff", head: "#d6f0ff", food: "#ffc857", text: "#e7eef5", obstacle: "#6b7b95", powerup: "#ffffff" },
    { bg: "#121212", grid: "#1e1e1e", snake: "#b4e197", head: "#d6ffb7", food: "#ff7aa2", text: "#efefef", obstacle: "#7a7a7a", powerup: "#ffffff" },
];

function eq(a: Cell, b: Cell) { return a.x === b.x && a.y === b.y; }

// RNG (daily)
class RNG {
    private s: number;
    constructor(seed: number) { this.s = seed >>> 0; }
    next() { this.s = (1664525 * this.s + 1013904223) >>> 0; return this.s / 0xffffffff; }
}
function todaySeed(): number {
    const d = new Date();
    return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0;
}

// Options & modes
export type GameOptions = {
    mode: "classic" | "time" | "zen" | "hardcore";
    seeded?: boolean;
    grid?: 16 | 20 | 24;
    portals?: boolean;
    dash?: boolean;
    dashCooldownSec?: number;
    magnetPower?: boolean;
    mirrorPower?: boolean;
    shrinkArena?: boolean;
    particles?: boolean;
    sfx?: Sfx;
};

export class Game {
    readonly grid: number;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private cell: number;
    private offX = 0; private offY = 0;

    private snake: Cell[] = [];
    private dir: Dir = "right";
    private food: Cell = { x: 10, y: 10 };

    private obstacles: Cell[] = [];
    private obstaclesEnabled = false;
    private wrap = false;

    private power: ActivePower | null = null;
    private powerSpawn: PowerSpawn | null = null;

    // Portals
    private portalsEnabled = false;
    private portalA: Cell | null = null;
    private portalB: Cell | null = null;
    private portalPhase = 0;

    // Dash
    private dashEnabled = false;
    private dashCooldownMs = 5000;
    private dashLeftMs = 0;

    // Combo
    private combo = 1;
    private comboTimerMs = 0;
    private readonly comboWindow = 4000;
    private readonly comboMax = 4;

    // Shrinking Arena
    private shrinkEnabled = false;
    private shrinkInset = 0;
    private shrinkTimerMs = 0;
    private shrinkEveryMs = 12000;

    // Particles
    private particlesEnabled = true;
    private particles: { x: number; y: number; vx: number; vy: number; a: number; life: number; color: string }[] = [];

    // Score / état
    private score = 0;
    private best = 0;
    private alive = true;
    private paused = false;

    private baseStep = 140;
    private stepMs = this.baseStep;
    private accumulator = 0;

    private themeIndex = 0;

    private mode: GameOptions["mode"] = "classic";
    private timeLimitMs: number | null = null;
    private timeLeftMs: number | null = null;

    private seeded = false;
    private rng: RNG | null = null;

    // SFX + screen shake
    private sfx: Sfx | null = null;
    private shakeMs = 0;

    // Achievements (toasts)
    private toasts: { text: string; msLeft: number }[] = [];
    private milestones = new Set<number>();

    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, best: number, options?: GameOptions) {
        this.ctx = ctx; this.canvas = canvas;

        const opts = options ?? { mode: "classic" };
        this.grid = opts.grid ?? 24;

        const size = Math.min(canvas.width, canvas.height);
        this.cell = Math.floor(size / this.grid);
        const board = this.cell * this.grid;
        this.offX = Math.floor((canvas.width - board) / 2);
        this.offY = Math.floor((canvas.height - board) / 2);

        this.best = best;
        this.applyMode(opts);
        this.applyExtras(opts);
        this.resetCore();
    }

    private applyMode(opts: GameOptions) {
        this.mode = opts.mode;
        this.seeded = !!opts.seeded;
        this.rng = this.seeded ? new RNG(todaySeed()) : null;

        if (this.mode === "classic") {
            this.baseStep = 140; this.stepMs = this.baseStep;
            this.wrap = false; this.obstaclesEnabled = false;
            this.timeLimitMs = null; this.timeLeftMs = null;
        }
        if (this.mode === "time") {
            this.baseStep = 130; this.stepMs = this.baseStep;
            this.wrap = false; this.obstaclesEnabled = false;
            this.timeLimitMs = 60_000; this.timeLeftMs = this.timeLimitMs;
        }
        if (this.mode === "zen") {
            this.baseStep = 160; this.stepMs = this.baseStep;
            this.wrap = true; this.obstaclesEnabled = false;
            this.timeLimitMs = null; this.timeLeftMs = null;
        }
        if (this.mode === "hardcore") {
            this.baseStep = 110; this.stepMs = this.baseStep;
            this.wrap = false; this.obstaclesEnabled = true;
            this.timeLimitMs = null; this.timeLeftMs = null;
        }
    }

    private applyExtras(opts: GameOptions) {
        this.portalsEnabled = !!opts.portals;
        this.dashEnabled = !!opts.dash;
        this.dashCooldownMs = (opts.dashCooldownSec ?? 5) * 1000;
        this.dashLeftMs = 0;

        this.shrinkEnabled = !!opts.shrinkArena;
        this.particlesEnabled = !!opts.particles;
        this.sfx = opts.sfx ?? null;
    }

    // HUD getters
    getDir(): Dir { return this.dir; }
    getScore(): number { return this.score; }
    getBest(): number { return this.best; }
    isAlive(): boolean { return this.alive; }
    isPaused(): boolean { return this.paused; }
    speedMultiplier(): number { return +(this.baseStep / this.stepMs).toFixed(1); }
    isWrap(): boolean { return this.wrap; }
    isObstacles(): boolean { return this.obstaclesEnabled; }
    getTheme(): Theme { return THEMES[this.themeIndex]; }
    getActivePower() { return this.power; }
    getModeName(): string {
        if (this.mode === "classic") return "Classic";
        if (this.mode === "time") return "Time Attack";
        if (this.mode === "zen") return "Zen Wrap";
        return "Hardcore";
    }
    getTimeLeftSec(): number | null { return this.timeLeftMs !== null ? Math.max(0, this.timeLeftMs) / 1000 : null; }
    getComboMult(): number { return this.combo; }
    hasPortals(): boolean { return this.portalsEnabled && !!this.portalA && !!this.portalB; }
    isDashEnabled(): boolean { return this.dashEnabled; }
    isDashReady(): boolean { return this.dashLeftMs <= 0; }
    getDashCooldownLeft(): number { return Math.max(0, this.dashLeftMs) / 1000; }

    // Toggles
    togglePause() { if (this.alive) this.paused = !this.paused; }
    toggleWrap() { this.wrap = !this.wrap; }
    toggleObstacles() {
        this.obstaclesEnabled = !this.obstaclesEnabled;
        if (this.obstaclesEnabled && this.obstacles.length === 0) this.generateObstacles();
        if (!this.obstaclesEnabled) this.obstacles = [];
    }
    cycleTheme() { this.themeIndex = (this.themeIndex + 1) % THEMES.length; }

    // Dash
    tryDash() {
        if (!this.dashEnabled || !this.alive || this.paused) return;
        if (this.dashLeftMs > 0) return;
        this.performStep(true);
        this.dashLeftMs = this.dashCooldownMs;
        this.sfx?.dash();
        this.shake(120);
    }

    // Update
    update(dt: number, proposedDir: Dir) {
        if (!this.alive || this.paused) return;

        // Mirror (inverse contrôles)
        const mirrored = this.power?.type === "mirror";
        const applyMirror = (d: Dir): Dir =>
            !mirrored ? d :
                d === "up" ? "down" :
                    d === "down" ? "up" :
                        d === "left" ? "right" : "left";

        this.dir = applyMirror(proposedDir);

        // timers
        if (this.timeLeftMs !== null) {
            this.timeLeftMs -= dt;
            if (this.timeLeftMs <= 0) { this.timeLeftMs = 0; this.gameOver(); return; }
        }
        if (this.power) {
            this.power.msLeft -= dt;
            if (this.power.msLeft <= 0) this.power = null;
        }
        if (this.dashLeftMs > 0) this.dashLeftMs -= dt;
        if (this.combo > 1) {
            this.comboTimerMs -= dt;
            if (this.comboTimerMs <= 0) { this.combo = 1; this.comboTimerMs = 0; }
        }
        if (this.shrinkEnabled && !this.wrap) {
            this.shrinkTimerMs += dt;
            const maxInset = Math.floor(this.grid / 2) - 2;
            if (this.shrinkTimerMs >= this.shrinkEveryMs && this.shrinkInset < maxInset) {
                this.shrinkInset++;
                this.shrinkTimerMs = 0;
                this.toast(`L'arène rétrécit ! (+${this.shrinkInset})`);
                const head = this.snake[this.snake.length - 1];
                if (!this.inBounds(head.x, head.y)) { this.gameOver(); return; }
            }
        }
        if (this.portalsEnabled) this.portalPhase = (this.portalPhase + dt * 0.006) % (Math.PI * 2);
        if (this.mode !== "hardcore" && !this.powerSpawn && this.rand() < 0.003) this.spawnPowerUp();

        const effectiveStep = this.power?.type === "slow" ? this.stepMs * 1.6 : this.stepMs;
        this.accumulator += dt;
        while (this.accumulator >= effectiveStep) {
            this.performStep(false);
            this.accumulator -= effectiveStep;
        }

        if (this.power?.type === "magnet") this.pullFoodTowardHead();

        // update particles
        if (this.particles.length) {
            const f = 0.98;
            for (const p of this.particles) {
                p.x += p.vx; p.y += p.vy; p.vx *= f; p.vy *= f; p.life -= 16; p.a *= 0.97;
            }
            this.particles = this.particles.filter(p => p.life > 0 && p.a > 0.02);
        }

        if (this.shakeMs > 0) this.shakeMs -= dt;
    }

    private performStep(isDash: boolean) {
        if (!this.stepCore()) return;
        if (isDash && this.alive) this.stepCore();
    }

    private stepCore(): boolean {
        const head = this.snake[this.snake.length - 1];
        let nx = head.x, ny = head.y;
        if (this.dir === "left") nx--;
        if (this.dir === "right") nx++;
        if (this.dir === "up") ny--;
        if (this.dir === "down") ny++;

        // murs / arène
        if (this.wrap) {
            nx = (nx + this.grid) % this.grid;
            ny = (ny + this.grid) % this.grid;
        } else {
            if (!this.inBounds(nx, ny)) { this.gameOver(); return false; }
        }

        let nextHead: Cell = { x: nx, y: ny };

        // Portails
        if (this.hasPortals()) {
            if (this.portalA && eq(nextHead, this.portalA) && this.portalB) { nextHead = { ...this.portalB }; this.sfx?.portal(); }
            else if (this.portalB && eq(nextHead, this.portalB) && this.portalA) { nextHead = { ...this.portalA }; this.sfx?.portal(); }
        }

        // obstacles
        if (this.obstaclesEnabled && this.obstacles.some(o => eq(o, nextHead))) { this.gameOver(); return false; }
        // self
        if (this.snake.some(c => eq(c, nextHead)) && this.power?.type !== "ghost") { this.gameOver(); return false; }

        this.snake.push(nextHead);

        // power-up ramassé ?
        if (this.powerSpawn && eq(this.powerSpawn.pos, nextHead)) {
            this.activatePower(this.powerSpawn.type);
            this.powerSpawn = null;
            this.sfx?.power();
        }

        // nourriture ?
        if (eq(nextHead, this.food)) {
            const base = (this.power?.type === "x2" ? 2 : 1);
            this.score += base * this.combo;
            this.bumpCombo();
            this.adjustSpeed();
            this.spawnFood();
            if (this.obstaclesEnabled && this.rand() < 0.25) this.addSingleObstacle();
            if (this.portalsEnabled && this.rand() < 0.35) this.generatePortals();
            this.checkMilestones();
            this.sfx?.eat();
            this.emitParticles(nextHead.x, nextHead.y, "#ff5b6e");
        } else {
            this.snake.shift();
        }

        return true;
    }

    private inBounds(x: number, y: number) {
        const min = this.shrinkEnabled ? this.shrinkInset : 0;
        const max = this.grid - 1 - (this.shrinkEnabled ? this.shrinkInset : 0);
        return x >= min && y >= min && x <= max && y <= max;
    }

    private bumpCombo() {
        this.combo = Math.min(this.comboMax, this.combo + 1);
        this.comboTimerMs = this.comboWindow;
    }

    private adjustSpeed() {
        const level = Math.floor(this.score / 5);
        this.stepMs = Math.max(70, this.baseStep - level * 8);
    }

    private gameOver() {
        this.alive = false;
        saveBest(this.score);
        this.best = Math.max(this.best, this.score);
        this.sfx?.die();
        this.shake(300);
    }

    reset(options?: GameOptions) {
        if (options) { this.applyMode(options); this.applyExtras(options); }
        this.resetCore();
    }

    private resetCore() {
        this.score = 0;
        this.combo = 1;
        this.comboTimerMs = 0;
        this.alive = true;
        this.paused = false;
        this.stepMs = this.baseStep;
        this.accumulator = 0;
        this.power = null;
        this.powerSpawn = null;
        this.timeLeftMs = this.timeLimitMs;
        this.dashLeftMs = 0;
        this.portalPhase = 0;
        this.shrinkInset = 0;
        this.shrinkTimerMs = 0;
        this.toasts = [];
        this.milestones.clear();
        this.shakeMs = 0;
        this.particles = [];

        const cx = Math.floor(this.grid / 2);
        const cy = Math.floor(this.grid / 2);
        this.snake = [{ x: cx - 1, y: cy }, { x: cx, y: cy }, { x: cx + 1, y: cy }];
        this.dir = "right";
        this.spawnFood();

        if (this.obstaclesEnabled) this.generateObstacles(); else this.obstacles = [];
        if (this.portalsEnabled) this.generatePortals(); else { this.portalA = this.portalB = null; }
    }

    // RNG
    private rand(): number { return this.rng ? this.rng.next() : Math.random(); }
    private randInt(max: number): number { return Math.floor(this.rand() * max); }

    // Spawns
    private randomFreeCell(): Cell {
        let c: Cell;
        let guard = 0;
        do {
            c = { x: this.randInt(this.grid), y: this.randInt(this.grid) };
            guard++; if (guard > 500) break;
        } while (
            this.snake.some(s => eq(s, c)) ||
            eq(c, this.food) ||
            (this.obstaclesEnabled && this.obstacles.some(o => eq(o, c))) ||
            (this.powerSpawn && eq(c, this.powerSpawn.pos)) ||
            (this.portalA && eq(c, this.portalA)) ||
            (this.portalB && eq(c, this.portalB)) ||
            !this.inBounds(c.x, c.y)
        );
        return c;
    }

    private spawnFood() { this.food = this.randomFreeCell(); }

    private spawnPowerUp() {
        const options: PowerType[] = ["slow", "ghost", "x2", "magnet", "mirror"];
        const type = options[this.randInt(options.length)];
        this.powerSpawn = { pos: this.randomFreeCell(), type };
    }

    private activatePower(type: PowerType) {
        const duration =
            type === "x2" ? 6000 :
                type === "mirror" ? 5000 :
                    type === "magnet" ? 7000 :
                        5000;
        this.power = { type, msLeft: duration };
        const human =
            type === "slow" ? "Slow" :
                type === "ghost" ? "Ghost" :
                    type === "x2" ? "Score x2" :
                        type === "magnet" ? "Magnet" : "Mirror";
        this.toast(`${human} actif`);
    }

    private generateObstacles() {
        this.obstacles = [];
        const base = this.mode === "hardcore" ? 16 : 10;
        for (let i = 0; i < base; i++) this.addSingleObstacle();
    }
    private addSingleObstacle() { this.obstacles.push(this.randomFreeCell()); }

    private generatePortals() {
        this.portalA = this.randomFreeCell();
        do { this.portalB = this.randomFreeCell(); } while (eq(this.portalB!, this.portalA));
    }

    // Food magnet
    private pullFoodTowardHead() {
        const head = this.snake[this.snake.length - 1];
        const dx = Math.sign(head.x - this.food.x);
        const dy = Math.sign(head.y - this.food.y);
        let nx = this.food.x, ny = this.food.y;
        if (Math.abs(head.x - this.food.x) >= Math.abs(head.y - this.food.y)) nx += dx;
        else ny += dy;
        const candidate: Cell = { x: nx, y: ny };
        const blocked =
            !this.inBounds(candidate.x, candidate.y) ||
            this.snake.some(s => eq(s, candidate)) ||
            (this.obstaclesEnabled && this.obstacles.some(o => eq(o, candidate)));
        if (!blocked) this.food = candidate;
    }

    // Particles
    private emitParticles(cx: number, cy: number, color: string) {
        if (!this.particlesEnabled) return;
        for (let i = 0; i < 10; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 0.5 + Math.random() * 1.6;
            this.particles.push({
                x: this.offX + cx * this.cell + this.cell / 2,
                y: this.offY + cy * this.cell + this.cell / 2,
                vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                a: 1, life: 400 + Math.random() * 300, color
            });
        }
    }

    private toast(text: string) { this.toasts.push({ text, msLeft: 2000 }); }
    private checkMilestones() {
        const marks = [10, 25, 50];
        for (const m of marks) {
            if (this.score >= m && !this.milestones.has(m)) {
                this.milestones.add(m);
                this.toast(`🏆 Palier ${m} !`);
                this.sfx?.milestone();
            }
        }
    }

    private shake(ms: number) { this.shakeMs = Math.max(this.shakeMs, ms); }

    // Drawing
    draw() {
        const t = this.getTheme();
        const ctx = this.ctx;

        // screen shake offset
        const ox = this.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;
        const oy = this.shakeMs > 0 ? (Math.random() - 0.5) * 6 : 0;

        // fond + grille
        ctx.fillStyle = t.bg;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = t.grid;
        for (let i = 0; i < this.grid; i++) {
            for (let j = 0; j < this.grid; j++) {
                ctx.fillRect(this.offX + i * this.cell + ox, this.offY + j * this.cell + oy, this.cell - 1, this.cell - 1);
            }
        }

        // Shrinking arena visual
        if (this.shrinkEnabled && this.shrinkInset > 0 && !this.wrap) {
            ctx.strokeStyle = "#ffba3a";
            ctx.lineWidth = Math.max(2, this.cell * 0.1);
            const x = this.offX + this.shrinkInset * this.cell + 1 + ox;
            const y = this.offY + this.shrinkInset * this.cell + 1 + oy;
            const w = (this.grid - this.shrinkInset * 2) * this.cell - 2;
            const h = w;
            ctx.strokeRect(x, y, w, h);
        }

        // obstacles
        if (this.obstaclesEnabled) {
            ctx.fillStyle = t.obstacle;
            for (const o of this.obstacles) this.drawCellWithOffset(o.x, o.y, ox, oy);
        }

        // portails
        if (this.hasPortals()) {
            this.drawPortal(this.portalA!, "#7ad2ff", ox, oy);
            this.drawPortal(this.portalB!, "#ff97e6", ox, oy);
        }

        // power-up (icône seule)
        if (this.powerSpawn) this.drawPowerup(this.powerSpawn, ox, oy);

        // food
        ctx.fillStyle = t.food;
        this.drawCellWithOffset(this.food.x, this.food.y, ox, oy);

        // snake
        ctx.fillStyle = t.snake;
        for (let i = 0; i < this.snake.length - 1; i++) this.drawCellWithOffset(this.snake[i].x, this.snake[i].y, ox, oy);
        ctx.fillStyle = t.head;
        const head = this.snake[this.snake.length - 1];
        this.drawCellWithOffset(head.x, head.y, ox, oy);

        // particles (dessus)
        if (this.particles.length) {
            for (const p of this.particles) {
                ctx.globalAlpha = p.a;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x + ox - 2, p.y + oy - 2, 4, 4);
            }
            ctx.globalAlpha = 1;
        }

        // overlay pause / fin → score + best + aide
        if (this.paused || !this.alive) {
            const boardW = this.cell * this.grid;
            const boardH = this.cell * this.grid;
            const cx = this.offX + boardW / 2;
            const cy = this.offY + boardH / 2;

            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(this.offX, this.offY, boardW, boardH);

            ctx.fillStyle = t.text;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (this.paused) {
                ctx.font = "bold 28px ui-sans-serif, system-ui, Arial";
                ctx.fillText("PAUSE", cx, cy - 10);
            } else {
                ctx.font = "bold 24px ui-sans-serif, system-ui, Arial";
                ctx.fillText(`Score : ${this.score}`, cx, cy - 14);
                ctx.font = "bold 18px ui-sans-serif, system-ui, Arial";
                ctx.fillText(`Meilleur : ${this.best}`, cx, cy + 12);
            }

            const line = "ZQSD • Espace: pause • R/↻: rejouer • F: dash • T: thème • W: wrap • O: obstacles";
            ctx.font = "13px ui-sans-serif, system-ui, Arial";
            ctx.fillText(line, cx, cy + 40);
        }

        // toasts
        this.drawToasts();
    }

    private drawCellWithOffset(x: number, y: number, ox: number, oy: number) {
        this.ctx.fillRect(
            this.offX + x * this.cell + 1 + ox,
            this.offY + y * this.cell + 1 + oy,
            this.cell - 2, this.cell - 2
        );
    }

    private drawPowerup(spawn: PowerSpawn, ox = 0, oy = 0) {
        const ctx = this.ctx;
        const t = this.getTheme();
        const { x, y } = spawn.pos;
        let icon = "★";
        if (spawn.type === "slow") icon = "⏳";
        else if (spawn.type === "ghost") icon = "👻";
        else if (spawn.type === "x2") icon = "x2";
        else if (spawn.type === "magnet") icon = "🧲";
        else if (spawn.type === "mirror") icon = "⇄";

        ctx.fillStyle = t.powerup;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fontSize = Math.floor(this.cell * (spawn.type === "x2" ? 0.55 : 0.7));
        ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, Apple Color Emoji, Segoe UI Emoji, Arial`;
        ctx.fillText(
            icon,
            this.offX + x * this.cell + this.cell / 2 + ox,
            this.offY + y * this.cell + this.cell / 2 + oy
        );
    }

    private drawPortal(cell: Cell, color: string, ox = 0, oy = 0) {
        const ctx = this.ctx;
        const cx = this.offX + cell.x * this.cell + this.cell / 2 + ox;
        const cy = this.offY + cell.y * this.cell + this.cell / 2 + oy;
        const rOuter = (this.cell * 0.48);
        const rInner = (this.cell * 0.26);
        const phase = this.portalPhase;

        const grad = ctx.createRadialGradient(cx, cy, rInner * 0.2, cx, cy, rOuter);
        grad.addColorStop(0, this.withAlpha(color, 0.25));
        grad.addColorStop(1, this.withAlpha(color, 0.0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, rOuter, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = this.withAlpha(color, 0.9);
        ctx.lineWidth = Math.max(2, this.cell * 0.12);
        ctx.beginPath(); ctx.arc(cx, cy, (rOuter + rInner) / 2, 0, Math.PI * 2); ctx.stroke();

        ctx.lineWidth = Math.max(1.2, this.cell * 0.07);
        const turns = 3;
        for (let i = 0; i < turns; i++) {
            const a0 = phase + i * (Math.PI * 2 / turns);
            const a1 = a0 + Math.PI * 1.15;
            ctx.strokeStyle = this.withAlpha(color, 0.85 - i * 0.18);
            ctx.beginPath();
            ctx.arc(cx, cy, (rInner + rOuter) / 2 - i * (this.cell * 0.05), a0, a1);
            ctx.stroke();
        }

        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.beginPath(); ctx.arc(cx, cy, rInner, 0, Math.PI * 2); ctx.fill();
    }

    private withAlpha(hex: string, alpha: number): string {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!m) return hex;
        const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    private drawToasts() {
        const ctx = this.ctx;
        const boardW = this.cell * this.grid;
        const x = this.offX + boardW / 2;
        let y = this.offY + 24;
        for (const t of this.toasts) {
            ctx.globalAlpha = Math.max(0, Math.min(1, t.msLeft / 500));
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = "bold 14px ui-sans-serif, system-ui, Arial";
            ctx.fillText(t.text, x, y);
            y += 18;
            ctx.globalAlpha = 1;
            t.msLeft -= 16;
        }
        this.toasts = this.toasts.filter(t => t.msLeft > 0);
    }
}