export type Event =
    | { type: "eat"; x: number; y: number }
    | { type: "die" }
    | { type: "power"; power: string }
    | { type: "portal" }
    | { type: "milestone"; value: number };

export class EventBus {
    public q: Event[] = [];
    emit(e: Event) { this.q.push(e); }
    drain(): Event[] { const r = this.q; this.q = []; return r; }
}