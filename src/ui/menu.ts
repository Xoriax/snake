import type { Options } from "../core/types";
import { SETTINGS_KEY } from "../app/config";

type Persist = Options & { dashCooldownSec: number, volume: number, mute: boolean };

export function readOptionsFromMenu(): { opts: Options, audio: { mute: boolean; volume: number } } {
    const mode = (document.getElementById("mode") as HTMLSelectElement).value as Options["mode"];
    const grid = Number((document.getElementById("grid") as HTMLSelectElement).value) as 16 | 20 | 24;
    const seeded = (document.getElementById("daily-seed") as HTMLInputElement).checked;
    const portals = (document.getElementById("portals") as HTMLInputElement).checked;
    const dash = (document.getElementById("dash") as HTMLInputElement).checked;
    const dashCooldownSec = Number((document.getElementById("dash-cd") as HTMLSelectElement).value);
    const particles = (document.getElementById("particles") as HTMLInputElement).checked;
    const shrinkArena = (document.getElementById("shrink") as HTMLInputElement).checked;
    const magnetPower = (document.getElementById("magnet") as HTMLInputElement).checked;
    const mirrorPower = (document.getElementById("mirror") as HTMLInputElement).checked;
    const mute = (document.getElementById("mute") as HTMLInputElement).checked;
    const volume = Number((document.getElementById("volume") as HTMLInputElement).value);

    const opts: Options = { mode, grid, seeded, portals, dash, dashCooldownSec, particles, shrinkArena, magnetPower, mirrorPower };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...opts, mute, volume } as Persist));
    return { opts, audio: { mute, volume } };
}

export function restoreMenu() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const s = JSON.parse(raw) as Partial<Persist>;
        if (s.mode) (document.getElementById("mode") as HTMLSelectElement).value = s.mode;
        if (s.grid) (document.getElementById("grid") as HTMLSelectElement).value = String(s.grid);
        (document.getElementById("daily-seed") as HTMLInputElement).checked = !!s.seeded;
        (document.getElementById("portals") as HTMLInputElement).checked = !!s.portals;
        (document.getElementById("dash") as HTMLInputElement).checked = !!s.dash;
        (document.getElementById("dash-cd") as HTMLSelectElement).value = String(s.dashCooldownSec ?? 5);
        (document.getElementById("particles") as HTMLInputElement).checked = !!(s as any).particles;
        (document.getElementById("shrink") as HTMLInputElement).checked = !!s.shrinkArena;
        (document.getElementById("magnet") as HTMLInputElement).checked = !!s.magnetPower;
        (document.getElementById("mirror") as HTMLInputElement).checked = !!s.mirrorPower;
        if ("volume" in s) (document.getElementById("volume") as HTMLInputElement).value = String((s as any).volume ?? 0.6);
        if ("mute" in s) (document.getElementById("mute") as HTMLInputElement).checked = !!(s as any).mute;
    } catch { }
}