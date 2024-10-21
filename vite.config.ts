import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		entries: ['src/routes/**/+*.{js,ts,svelte}', 'src/hooks*.{js,ts}']
	}
});
