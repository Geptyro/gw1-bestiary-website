import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Runs as a real SvelteKit Node server (full SSR / per-request logic
		// available). The known NPC roster is still prerendered at build time for
		// speed (see `export const prerender = true` in the routes), but the server
		// also handles anything dynamic and serves its own 404s — so no per-site
		// Caddyfile / try_files is needed.
		adapter: adapter(),
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
