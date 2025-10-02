import type { Cell } from "./types";

export function wrapCoord(v: number, grid: number) { return (v + grid) % grid; }
export function inBounds(x: number, y: number, grid: number, inset = 0) {
    const min = inset, max = grid - 1 - inset;
    return x >= min && y >= min && x <= max && y <= max;
}
export function eq(a: Cell, b: Cell) { return a.x === b.x && a.y === b.y; }