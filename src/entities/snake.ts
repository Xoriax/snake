import type { Cell } from "../core/types";

export const pushHead = (snake: Cell[], h: Cell) => { snake.push(h); };
export const popTail = (snake: Cell[]) => { snake.shift(); };
export const head = (snake: Cell[]) => snake[snake.length - 1];
export const some = (snake: Cell[], p: (c: Cell) => boolean) => snake.some(p);