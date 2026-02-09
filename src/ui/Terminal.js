export class Terminal {
	constructor(terminalId, inputId, inputAreaId, soundManager) {
		this.container = document.getElementById(terminalId);
		this.input = document.getElementById(inputId);
		this.inputArea = document.getElementById(inputAreaId);
		this.soundManager = soundManager;
		this.onCommand = null;
	}

	init(onCommand) {
		this.onCommand = onCommand;
		this.input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				const cmd = this.input.value;
				this.print(`> ${cmd}`);
				if (this.onCommand) this.onCommand(cmd);
				this.input.value = '';
			}
		});

		// Ensure focus
		document.body.addEventListener('click', () => this.input.focus());
	}

	print(text, className = '', speed = 20) {
		const div = document.createElement('div');
		div.className = className;
		this.container.appendChild(div);

		if (speed === 0) {
			div.innerHTML = text.replace(/\*(.*?)\*/g, '<b>$1</b>');
			this.container.scrollTop = this.container.scrollHeight;
			return Promise.resolve();
		}

		if (this.soundManager) this.soundManager.playBeep(2000, 0.05);

		return new Promise((resolve) => {
			let i = 0;
			let currentText = "";
			const timer = setInterval(() => {
				if (this.soundManager) this.soundManager.playClick();

				currentText += text.charAt(i);
				// Apply bold conversion on the fly to see tags immediately or wait?
				// Better: update innerHTML with the partial text converted
				div.innerHTML = currentText.replace(/\*(.*?)\*/g, '<b>$1</b>');

				i++;
				if (i >= text.length) {
					clearInterval(timer);
					resolve();
				}
				this.container.scrollTop = this.container.scrollHeight;
			}, speed);
		});
	}

	printHTML(html) {
		const div = document.createElement('div');
		div.innerHTML = html;
		this.container.appendChild(div);
		this.container.scrollTop = this.container.scrollHeight;
	}

	clear() {
		this.container.innerHTML = '';
	}

	setPrompt(text) {
		const promptSpan = this.inputArea.querySelector('.prompt');
		if (promptSpan) promptSpan.textContent = text;
	}

	hideInput() {
		this.inputArea.style.display = 'none';
	}

	showInput() {
		this.inputArea.style.display = 'flex';
		this.input.focus();
	}
}
