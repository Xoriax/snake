import { createServices } from "./di";
import { readOptionsFromMenu, restoreMenu } from "../ui/menu";
import { Input } from "../ui/input";
import { loadBest, saveBest } from "../ui/storage";
import { createState } from "../core/state";
import type { Dir } from "../core/types";

import { applyDirection } from "../systems/movement.system";
import { tickTimeAttack } from "../systems/timeattack.system";
import { tickPowerTimers } from "../systems/powerup.system";
import { tickPortalPhase, ensureInitialPortals } from "../systems/portal.spawn.system";

import { tickCombo } from "../systems/combo.system";
import { tickDash, tryDash } from "../systems/dash.system";
import { tickShrink } from "../systems/shrink.system";
import { tickParticles } from "../systems/particles.system";
import { ensureObstacles } from "../systems/obstacle.system";
import { checkMilestones } from "../systems/achievement.system";
import { maybeMagnetFood } from "../systems/food.system";
import { stepOnce } from "../systems/stepOnce";
import { playAudioFromEvents } from "../systems/audio.system";

import { updateHud } from "../ui/hud";
import { showGameUI, showMenuUI, showPostGame } from "../ui/postgame";

import { THEMES } from "./config";
import { drawBoard } from "../rendering/board.renderer";
import { drawSnake } from "../rendering/snake.renderer";
import { drawFoodAndPower } from "../rendering/items.renderer";
import { drawPortals } from "../rendering/portal.renderer";
import { drawParticles } from "../rendering/particle.renderer";
import { drawOverlayIfNeeded } from "../rendering/overlay.renderer";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const services = createServices();
const input = new Input();

let state = createState(canvas, loadBest(), services, { mode: "classic" });
let themeIndex = 0;
let last = 0;
let running = false;

// UI DOM
const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
const replayBtn = document.getElementById("replay-btn") as HTMLButtonElement;
const homeBtn = document.getElementById("home-btn") as HTMLButtonElement;
const muteChk = document.getElementById("mute") as HTMLInputElement;
const volumeRange = document.getElementById("volume") as HTMLInputElement;

function start() {
    const { opts, audio } = readOptionsFromMenu();
    services.sfx.initIfNeeded?.();
    services.sfx.setMuted?.(audio.mute);
    services.sfx.setVolume?.(audio.volume);

    state = createState(canvas, loadBest(), services, opts);
    input.reset("right");
    themeIndex = 0;
    running = true;
    showGameUI();
    last = performance.now();
    requestAnimationFrame(loop);
    ensureInitialPortals(state);
}

function loop(now: number) {
    if (!running) return;
    const dt = now - last; last = now;

    // 1) input → direction
    const proposed: Dir = input.popDirection(state.dir);
    applyDirection(state, proposed);

    // 2) timers & systems qui tournent au dt
    tickTimeAttack(state, dt);
    tickPowerTimers(state, dt);
    tickPortalPhase(state, dt);
    tickCombo(state, dt);
    tickDash(state, dt);
    tickShrink(state, dt);
    tickParticles(state);
    ensureObstacles(state);
    maybeMagnetFood(state);

    // 3) step selon stepMs / slow power
    const effectiveStep = state.power?.type === "slow" ? state.stepMs * 1.6 : state.stepMs;
    state.accumulator += dt;
    while (state.accumulator >= effectiveStep && state.alive) {
        stepOnce(state);
        state.accumulator -= effectiveStep;
    }

    // 4) audio + milestones
    checkMilestones(state);
    const events = state.events.drain();
    playAudioFromEvents(state, events);

    // 5) draw
    drawBoard(state, ctx, themeIndex);
    drawPortals(state, ctx);
    drawFoodAndPower(state, ctx, themeIndex);
    drawSnake(state, ctx, themeIndex);
    drawParticles(state, ctx);
    drawOverlayIfNeeded(state, ctx, themeIndex);

    // 6) HUD & postgame
    updateHud(state);
    if (!state.alive) {
        showPostGame(true);
        saveBest(state.score);
        state.best = Math.max(state.best, state.score);
    }

    requestAnimationFrame(loop);
}

// UI events
playBtn.addEventListener("click", start);
replayBtn.addEventListener("click", () => { if (!running) return; start(); });
homeBtn.addEventListener("click", () => { running = false; showMenuUI(); });

muteChk.addEventListener("change", () => services.sfx.setMuted?.(muteChk.checked));
volumeRange.addEventListener("input", () => services.sfx.setVolume?.(Number(volumeRange.value)));

// Shortcuts
window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    if (!running) return;
    if (k === " ") state.paused = !state.paused;
    if (k === "r") start();
    if (k === "m") { running = false; showMenuUI(); }
    if (k === "t") themeIndex = (themeIndex + 1) % THEMES.length;
    if (k === "w") state.wrap = !state.wrap;
    if (k === "o") state.obstaclesEnabled = !state.obstaclesEnabled;
    if (k === "f") tryDash(state);
}, { passive: false });

// init
restoreMenu();
showMenuUI();