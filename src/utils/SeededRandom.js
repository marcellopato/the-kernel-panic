export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    // Mulberry32
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    setSeed(seed) {
        this.seed = seed;
    }
}

export const rng = new SeededRandom(Date.now());
