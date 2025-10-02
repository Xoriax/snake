export class RNG {
    private s: number;
    constructor(seed: number) { this.s = seed >>> 0; }
    next() { this.s = (1664525 * this.s + 1013904223) >>> 0; return this.s / 0xffffffff; }
}
export function todaySeed(): number {
    const d = new Date();
    return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) >>> 0;
}