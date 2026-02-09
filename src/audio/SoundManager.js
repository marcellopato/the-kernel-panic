export class SoundManager {
	constructor() {
		this.ctx = null;
		this.masterGain = null;
		this.ambientOscillators = [];
		this.isStarted = false;
	}

	init() {
		if (this.isStarted) return;
		this.ctx = new (window.AudioContext || window.webkitAudioContext)();
		this.masterGain = this.ctx.createGain();
		this.masterGain.gain.value = 0.3;
		this.masterGain.connect(this.ctx.destination);
		this.isStarted = true;
		// this.startAmbient(); // Removed per user request
	}

	// --- EFFECT SYNTHESIZERS ---

	playClick() {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'square';
		// Higher pitch for a "snappier" click
		osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);

		gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(1e-10, this.ctx.currentTime + 0.02);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start();
		osc.stop(this.ctx.currentTime + 0.02);
	}

	playBeep(freq = 440, duration = 0.2) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'square';
		osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

		gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

		osc.connect(gain);
		gain.connect(this.masterGain);

		osc.start();
		osc.stop(this.ctx.currentTime + duration);
	}

	playGlitch() {
		if (!this.ctx) return;
		const noise = this.ctx.createBufferSource();
		const bufferSize = this.ctx.sampleRate * 0.1;
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		noise.buffer = buffer;
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

		noise.connect(gain);
		gain.connect(this.masterGain);
		noise.start();
	}

	// --- AMBIENT SYNTHESIZER ---

	startAmbient() {
		// Diminished chord drone (C dim: C, Eb, Gb)
		const freqs = [130.81, 155.56, 185.00]; // Low C, Eb, Gb

		freqs.forEach((f, i) => {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();

			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(f, this.ctx.currentTime);

			// Subtle LFO for "unstable machine" feel
			const lfo = this.ctx.createOscillator();
			const lfoGain = this.ctx.createGain();
			lfo.frequency.setValueAtTime(0.5 + Math.random(), this.ctx.currentTime);
			lfoGain.gain.setValueAtTime(2, this.ctx.currentTime);
			lfo.connect(lfoGain);
			lfoGain.connect(osc.frequency);
			lfo.start();

			gain.gain.setValueAtTime(0, this.ctx.currentTime);
			gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 2);

			osc.connect(gain);
			gain.connect(this.masterGain);

			osc.start();
			this.ambientOscillators.push({ osc, gain, lfo });
		});
	}
}
