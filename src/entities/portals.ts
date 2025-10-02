import type { Cell } from "../core/types";

export type Portals = { A: Cell | null, B: Cell | null };
export const setPortals = (p: Portals, A: Cell | null, B: Cell | null) => { p.A = A; p.B = B; };