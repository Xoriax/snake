const BEST_KEY = "snake_best_score_v2";
export function loadBest(): number {
    const raw = localStorage.getItem(BEST_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
}
export function saveBest(score: number): void {
    const best = loadBest();
    if (score > best) localStorage.setItem(BEST_KEY, String(score));
}