/// <reference types="vitest/config" />
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static site, no server - suitable for GitHub Pages.
			// All routes are prerendered (see src/routes/+layout.ts), so no fallback is needed.
			// See https://svelte.dev/docs/kit/adapter-static for more information.
			adapter: adapter(),

			// GitHub Pages serves project sites from /<repo-name>/, so the base
			// path is set via BASE_PATH when building for deployment (see
			// .github/workflows/deploy.yml). Locally this is empty.
			paths: {
				base: process.env.BASE_PATH ?? ''
			}
		})
	],
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts']
	}
});
