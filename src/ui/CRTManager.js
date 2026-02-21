export class CRTManager {
	constructor(bodyClass = 'crt') {
		this.element = document.body;
		this.className = bodyClass;
	}

	triggerGlitch(duration = 500) {
		this.element.classList.add('glitch-active');
		setTimeout(() => {
			this.element.classList.remove('glitch-active');
		}, duration);
	}

	updatePanic(level) {
		this.element.classList.remove('panic-low', 'panic-med', 'panic-crit', 'panic-dead');
		if (level > 25 && level <= 50) this.element.classList.add('panic-low');
		if (level > 50 && level <= 80) this.element.classList.add('panic-med');
		if (level > 80 && level < 100) this.element.classList.add('panic-crit');
		if (level >= 100) this.element.classList.add('panic-dead');
	}
}
