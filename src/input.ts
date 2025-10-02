export type Dir = "up" | "down" | "left" | "right";

export class Input {
    private queue: Dir[] = [];
    private lastAppliedDir: Dir = "right";

    constructor() {
        window.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();

            // Empêche scroll (espace / flèches)
            if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
                e.preventDefault();
            }

            // AZERTY ZQSD
            if (k === "z") this.pushDir("up");
            if (k === "s") this.pushDir("down");
            if (k === "q") this.pushDir("left");
            if (k === "d") this.pushDir("right");

            // Bonus: flèches
            if (k === "arrowup") this.pushDir("up");
            if (k === "arrowdown") this.pushDir("down");
            if (k === "arrowleft") this.pushDir("left");
            if (k === "arrowright") this.pushDir("right");
        }, { passive: false });
    }

    private pushDir(d: Dir) {
        if (this.queue.length < 3) this.queue.push(d); // petit buffer
    }

    /** Une seule direction max par tick, pas de demi-tour */
    popDirection(current: Dir): Dir {
        while (this.queue.length > 0) {
            const d = this.queue.shift()!;
            const invalid =
                (current === "left" && d === "right") ||
                (current === "right" && d === "left") ||
                (current === "up" && d === "down") ||
                (current === "down" && d === "up");

            if (!invalid) {
                this.lastAppliedDir = d;
                return d;
            }
        }
        return current;
    }

    reset(startDir: Dir = "right") {
        this.queue = [];
        this.lastAppliedDir = startDir;
    }
}