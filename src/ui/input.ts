export type Dir = "up" | "down" | "left" | "right";

/**
 * Gestion des entrées clavier (ZQSD + flèches).
 * Empêche les demi-tours instantanés et bufferise quelques entrées.
 */
export class Input {
    private queue: Dir[] = [];
    private lastAppliedDir: Dir = "right";

    constructor() {
        window.addEventListener("keydown", (e) => {
            const k = e.key.toLowerCase();

            // Empêche scroll sur espace / flèches
            if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
                e.preventDefault();
            }

            // AZERTY ZQSD
            if (k === "z") this.pushDir("up");
            if (k === "s") this.pushDir("down");
            if (k === "q") this.pushDir("left");
            if (k === "d") this.pushDir("right");

            // Flèches
            if (k === "arrowup") this.pushDir("up");
            if (k === "arrowdown") this.pushDir("down");
            if (k === "arrowleft") this.pushDir("left");
            if (k === "arrowright") this.pushDir("right");
        }, { passive: false });
    }

    private pushDir(d: Dir) {
        // On stocke jusqu’à 3 directions max pour fluidifier le jeu
        if (this.queue.length < 3) this.queue.push(d);
    }

    /**
     * Retourne une direction valide à appliquer ce tick.
     * Empêche les demi-tours instantanés.
     */
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

    /** Réinitialise l’entrée (utile lors des resets/rejouer) */
    reset(startDir: Dir = "right") {
        this.queue = [];
        this.lastAppliedDir = startDir;
    }
}