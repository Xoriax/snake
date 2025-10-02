import type { GameState } from "../core/state";
import type { Event } from "../core/events";

export function playAudioFromEvents(s: GameState, events: Event[]) {
    for (const e of events) {
        if (e.type === "eat") s.services.sfx.eat();
        else if (e.type === "die") s.services.sfx.die();
        else if (e.type === "power") s.services.sfx.power();
        else if (e.type === "portal") s.services.sfx.portal();
        else if (e.type === "milestone") {
            if (e.value === -1) s.services.sfx.dash(); // dash trigger
            else s.services.sfx.milestone();
        }
    }
}