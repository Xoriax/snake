import { Input } from "./input";
import { Game, type GameOptions, type Sfx } from "./game";
import { loadBest } from "./storage";

/** Simple sound engine (WebAudio beeps) */
class SoundFX implements Sfx {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private muted = false;
  private vol = 0.6;

  /** call once on first user gesture */
  initIfNeeded() {
    if (this.ctx) return;
    const a = new (window.AudioContext || (window as any).webkitAudioContext)();
    const g = a.createGain();
    g.gain.value = this.muted ? 0 : this.vol;
    g.connect(a.destination);
    this.ctx = a; this.master = g;
  }
  setMuted(m: boolean) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : this.vol; }
  setVolume(v: number) { this.vol = v; if (!this.muted && this.master) this.master.gain.value = v; }

  private blip(freq: number, dur = 0.08, type: OscillatorType = "sine") {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.9, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  eat() { this.blip(440, 0.07, "triangle"); }
  die() { this.blip(120, 0.18, "sawtooth"); this.blip(90, 0.22, "sawtooth"); }
  power() { this.blip(760, 0.09, "square"); }
  portal() { this.blip(520, 0.06, "sine"); this.blip(680, 0.06, "sine"); }
  dash() { this.blip(300, 0.05, "square"); }
  milestone() { this.blip(900, 0.12, "triangle"); this.blip(1200, 0.1, "triangle"); }
}

/* ====== PERSISTENCE KEY (déclarée UNE seule fois) ====== */
const SETTINGS_KEY = "snake_ui_settings_v3";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const sfx = new SoundFX();

// HUD
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

const hud = document.querySelector(".hud") as HTMLElement;
const help = document.querySelector(".help") as HTMLElement;
const badges = document.querySelector(".badges") as HTMLElement;

const badgeSlow = document.getElementById("badge-slow") as HTMLElement;
const badgeGhost = document.getElementById("badge-ghost") as HTMLElement;
const badgeX2 = document.getElementById("badge-x2") as HTMLElement;
const badgePort = document.getElementById("badge-portals") as HTMLElement;
const badgeMirror = document.getElementById("badge-mirror") as HTMLElement;
const badgeMagnet = document.getElementById("badge-magnet") as HTMLElement;

// Menu
const menu = document.getElementById("menu") as HTMLElement;
const playBtn = document.getElementById("play-btn") as HTMLButtonElement;
const modeSelect = document.getElementById("mode") as HTMLSelectElement;
const gridSelect = document.getElementById("grid") as HTMLSelectElement;
const dailySeedChk = document.getElementById("daily-seed") as HTMLInputElement;
const portalsChk = document.getElementById("portals") as HTMLInputElement;
const dashChk = document.getElementById("dash") as HTMLInputElement;
const dashCdSel = document.getElementById("dash-cd") as HTMLSelectElement;
const particlesChk = document.getElementById("particles") as HTMLInputElement;
const magnetChk = document.getElementById("magnet") as HTMLInputElement;
const mirrorChk = document.getElementById("mirror") as HTMLInputElement;
const shrinkChk = document.getElementById("shrink") as HTMLInputElement;
const muteChk = document.getElementById("mute") as HTMLInputElement;
const volumeRange = document.getElementById("volume") as HTMLInputElement;

// Postgame
const postgame = document.getElementById("postgame") as HTMLElement;
const replayBtn = document.getElementById("replay-btn") as HTMLButtonElement;
const homeBtn = document.getElementById("home-btn") as HTMLButtonElement;

const input = new Input();
let game: Game;
let last = 0;
let running = false;

function updateBadges() {
  const p = game.getActivePower();
  badgeSlow.style.display = p?.type === "slow" ? "inline-flex" : "none";
  badgeGhost.style.display = p?.type === "ghost" ? "inline-flex" : "none";
  badgeX2.style.display = p?.type === "x2" ? "inline-flex" : "none";
  badgePort.style.display = game.hasPortals() ? "inline-flex" : "none";
  badgeMirror.style.display = p?.type === "mirror" ? "inline-flex" : "none";
  badgeMagnet.style.display = p?.type === "magnet" ? "inline-flex" : "none";
}

function frame(now: number) {
  if (!running) return;
  const dt = now - last; last = now;

  const proposed = input.popDirection(game.getDir());
  game.update(dt, proposed);
  game.draw();

  scoreEl.textContent = String(game.getScore());
  bestEl.textContent = String(game.getBest());
  speedEl.textContent = `${game.speedMultiplier().toFixed(1)}x`;
  wrapEl.textContent = game.isWrap() ? "ON" : "OFF";
  obsEl.textContent = game.isObstacles() ? "ON" : "OFF";
  modeEl.textContent = game.getModeName();
  comboEl.textContent = `x${game.getComboMult()}`;
  updateBadges();

  const t = game.getTimeLeftSec();
  if (t !== null) { timerBox.style.display = "inline-flex"; timerEl.textContent = t.toFixed(1); }
  else { timerBox.style.display = "none"; }

  if (game.isDashEnabled()) {
    dashBox.style.display = "inline-flex";
    dashReadyEl.textContent = game.isDashReady() ? "OK" : `${game.getDashCooldownLeft().toFixed(1)}s`;
  } else dashBox.style.display = "none";

  postgame.style.display = game.isAlive() ? "none" : "flex";
  requestAnimationFrame(frame);
}

/* ====== Types & persistance ====== */
type Persist = Omit<GameOptions, "dashCooldownSec"> & { dashCooldownSec: number, volume: number, mute: boolean };

function buildOptionsFromUI(): GameOptions {
  const opts: GameOptions = {
    mode: modeSelect.value as GameOptions["mode"],
    seeded: dailySeedChk.checked,
    grid: Number(gridSelect.value) as 16 | 20 | 24,
    portals: portalsChk.checked,
    dash: dashChk.checked,
    dashCooldownSec: Number(dashCdSel.value),
    magnetPower: magnetChk.checked,
    mirrorPower: mirrorChk.checked,
    shrinkArena: shrinkChk.checked,
    particles: particlesChk.checked,
    sfx: sfx,
  };
  const persist: Persist = { ...opts, volume: Number(volumeRange.value), mute: muteChk.checked } as any;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(persist));
  return opts;
}

function restoreMenu() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const s = JSON.parse(raw) as Partial<Persist>;
    if (s.mode) modeSelect.value = s.mode as any;
    if (s.grid) gridSelect.value = String(s.grid);
    if ("seeded" in s) dailySeedChk.checked = !!s.seeded;
    if ("portals" in s) portalsChk.checked = !!s.portals;
    if ("dash" in s) dashChk.checked = !!s.dash;
    if ("dashCooldownSec" in s) dashCdSel.value = String(s.dashCooldownSec ?? 5);
    if ("magnetPower" in s) magnetChk.checked = !!s.magnetPower;
    if ("mirrorPower" in s) mirrorChk.checked = !!s.mirrorPower;
    if ("shrinkArena" in s) shrinkChk.checked = !!s.shrinkArena;
    if ("particles" in s) particlesChk.checked = !!(s as any).particles;
    if ("volume" in s && typeof s.volume === "number") volumeRange.value = String(s.volume);
    if ("mute" in s) { muteChk.checked = !!s.mute; sfx.setMuted(!!s.mute); }
    sfx.setVolume(Number(volumeRange.value));
  } catch { }
}

function startFromMenu() {
  sfx.initIfNeeded();
  sfx.setMuted(muteChk.checked);
  sfx.setVolume(Number(volumeRange.value));

  menu.style.display = "none";
  canvas.style.display = "block";
  hud.style.display = "flex";
  help.style.display = "block";
  badges.style.display = "flex";
  postgame.style.display = "none";

  const opts = buildOptionsFromUI();
  const best = loadBest();
  game = new Game(ctx, canvas, best, opts);
  input.reset("right");
  last = performance.now();
  running = true;
  requestAnimationFrame(frame);
}

function returnToMenu() {
  running = false;
  canvas.style.display = "none";
  hud.style.display = "none";
  help.style.display = "none";
  badges.style.display = "none";
  postgame.style.display = "none";
  menu.style.display = "flex";
}

// UI events
playBtn.addEventListener("click", startFromMenu);
replayBtn.addEventListener("click", () => { if (!running) return; game.reset(buildOptionsFromUI()); input.reset("right"); });
homeBtn.addEventListener("click", returnToMenu);

// audio controls
muteChk.addEventListener("change", () => sfx.setMuted(muteChk.checked));
volumeRange.addEventListener("input", () => sfx.setVolume(Number(volumeRange.value)));

// Raccourcis globaux
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if (!running) return;

  if (k === " ") game.togglePause();
  if (k === "r") { game.reset(buildOptionsFromUI()); input.reset("right"); }
  if (k === "m") { returnToMenu(); }
  if (k === "t") game.cycleTheme();
  if (k === "w") game.toggleWrap();
  if (k === "o") game.toggleObstacles();
  if (k === "f") game.tryDash();
}, { passive: false });

// init
restoreMenu();