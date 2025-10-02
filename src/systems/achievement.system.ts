import type { GameState } from "../core/state";
import { SCORE_MILESTONES } from "../app/config";

const seen = new Set<number>();
export function checkMilestones(s: GameState) {
    for (const m of SCORE_MILESTONES) {
        if (s.score >= m && !seen.has(m)) { seen.add(m); s.events.emit({ type: "milestone", value: m }); }
    }
}