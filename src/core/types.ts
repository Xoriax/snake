export type Dir = "up" | "down" | "left" | "right";

export type Cell = { x: number; y: number };

export type Theme = {
    bg: string; grid: string; snake: string; head: string;
    food: string; text: string; obstacle: string; powerup: string;
};

export type PowerType = "slow" | "ghost" | "x2" | "magnet" | "mirror";
export type ActivePower = { type: PowerType; msLeft: number };
export type PowerSpawn = { pos: Cell; type: PowerType };

export interface Sfx {
    eat(): void; die(): void; power(): void; portal(): void; dash(): void; milestone(): void;
    initIfNeeded?(): void; setMuted?(m: boolean): void; setVolume?(v: number): void;
}

export type Mode = "classic" | "time" | "zen" | "hardcore";

export type Options = {
    mode: Mode;
    seeded?: boolean;
    grid?: 16 | 20 | 24;
    portals?: boolean;
    dash?: boolean;
    dashCooldownSec?: number;
    magnetPower?: boolean;
    mirrorPower?: boolean;
    shrinkArena?: boolean;
    particles?: boolean;
};

export type Services = { sfx: Sfx };