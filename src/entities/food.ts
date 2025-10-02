import type { Cell } from "../core/types";

export const setFood = (state: { food: Cell }, c: Cell) => state.food = c;