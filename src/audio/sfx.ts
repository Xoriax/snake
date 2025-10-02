import type { Sfx } from "../core/types";

export class SfxImpl implements Sfx {
    private ctx: AudioContext | null = null;
    private master!: GainNode;
    private muted = false; private vol = 0.6;

    initIfNeeded() {
        if (this.ctx) return;
        const a = new (window.AudioContext || (window as any).webkitAudioContext)();
        const g = a.createGain(); g.gain.value = this.muted ? 0 : this.vol; g.connect(a.destination);
        this.ctx = a; this.master = g;
    }
    setMuted(m: boolean) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : this.vol; }
    setVolume(v: number) { this.vol = v; if (!this.muted && this.master) this.master.gain.value = v; }

    private blip(freq: number, dur = 0.08, type: OscillatorType = "sine") {
        if (!this.ctx) return;
        const t0 = this.ctx.currentTime; const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = type; o.frequency.setValueAtTime(freq, t0); g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.9, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(this.master); o.start(t0); o.stop(t0 + dur + 0.02);
    }
    eat() { this.blip(440, 0.07, "triangle"); }
    die() { this.blip(120, 0.18, "sawtooth"); this.blip(90, 0.22, "sawtooth"); }
    power() { this.blip(760, 0.09, "square"); }
    portal() { this.blip(520, 0.06, "sine"); this.blip(680, 0.06, "sine"); }
    dash() { this.blip(300, 0.05, "square"); }
    milestone() { this.blip(900, 0.12, "triangle"); this.blip(1200, 0.1, "triangle"); }
}