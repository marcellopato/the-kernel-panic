import { defineConfig } from 'vite';

export default defineConfig({
	// Set base to repo name for GitHub Pages subfolder deployment
	base: '/the-kernek-panic/',
	build: {
		outDir: 'dist',
	}
});
