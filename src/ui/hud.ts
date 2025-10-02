import type { GameState } from "../core/state";

const scoreEl = document.getElementById("score")!;
const bestEl = document.getElementById("best")!;
const speedEl = document.getElementById("speed")!;
const wrapEl = document.getElementById("wrap-flag")!;
const obsEl = document.getElementById("obs-flag")!;
const modeEl = document.getElementById("mode-name")!;
const comboEl = document.getElementById("combo")!;
const timerBox = document.getElementById("timer-box") as HTMLElement;
const timerEl = document.getElementById("timer")!;
const dashBox = document.getElementById("dash-box") as HTMLElement;
const dashReadyEl = document.getElementById("dash-ready")!;

// NOUVEAU : éléments de la colonne gauche
const sideMode = document.getElementById("side-mode");
const sideBest = document.getElementById("side-best");

const badges = {
    slow: document.getElementById("badge-slow") as HTMLElement,
    ghost: document.getElementById("badge-ghost") as HTMLElement,
    x2: document.getElementById("badge-x2") as HTMLElement,
    portals: document.getElementById("badge-portals") as HTMLElement,
    mirror: document.getElementById("badge-mirror") as HTMLElement,
    magnet: document.getElementById("badge-magnet") as HTMLElement,
};

export function updateHud(s: GameState) {
    scoreEl.textContent = String(s.score);
    bestEl.textContent = String(s.best);
    speedEl.textContent = `${(s.baseStep / s.stepMs).toFixed(1)}x`;
    wrapEl.textContent = s.wrap ? "ON" : "OFF";
    obsEl.textContent = s.obstaclesEnabled ? "ON" : "OFF";
    const modeName = s.mode[0].toUpperCase() + s.mode.slice(1);
    modeEl.textContent = modeName;

    // Miroir côté gauche
    if (sideMode) sideMode.textContent = modeName;
    if (sideBest) sideBest.textContent = String(s.best);

    comboEl.textContent = `x${s.combo}`;

    const t = s.timeLeftMs;
    if (t !== null) { timerBox.style.display = "inline-flex"; timerEl.textContent = (Math.max(0, t) / 1000).toFixed(1); }
    else timerBox.style.display = "none";

    if (s.dashEnabled) {
        dashBox.style.display = "inline-flex";
        dashReadyEl.textContent = s.dashLeftMs <= 0 ? "OK" : `${(s.dashLeftMs / 1000).toFixed(1)}s`;
    } else dashBox.style.display = "none";

    badges.slow.style.display = s.power?.type === "slow" ? "inline-flex" : "none";
    badges.ghost.style.display = s.power?.type === "ghost" ? "inline-flex" : "none";
    badges.x2.style.display = s.power?.type === "x2" ? "inline-flex" : "none";
    badges.portals.style.display = s.portalsEnabled && !!(s.portalA && s.portalB) ? "inline-flex" : "none";
    badges.mirror.style.display = s.power?.type === "mirror" ? "inline-flex" : "none";
    badges.magnet.style.display = s.power?.type === "magnet" ? "inline-flex" : "none";
}