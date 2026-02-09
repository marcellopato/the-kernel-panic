export class GameState {
	static SAVE_KEY = 'kernel_panic_save';

	static save(data) {
		localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
	}

	static load() {
		const saved = localStorage.getItem(this.SAVE_KEY);
		return saved ? JSON.parse(saved) : null;
	}

	static clear() {
		localStorage.removeItem(this.SAVE_KEY);
	}
}
