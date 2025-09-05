import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		entries: ['src/routes/**/+*.{js,ts,svelte}', 'src/hooks*.{js,ts}'],
		include: ['svelte-sonner', 'portal']
	}
});
