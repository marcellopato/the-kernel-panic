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
}
