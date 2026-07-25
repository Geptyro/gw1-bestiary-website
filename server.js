// Custom production server for adapter-node. Wraps SvelteKit's built `handler`
// so this SITE owns the cache policy for ITS assets — the gateway stays fully
// agnostic of paths like /npc/. (The gateway only rate-limits page navigations
// via Sec-Fetch-Dest; it sets no per-path headers.)
//
// adapter-node serves /npc/*.png through its internal sirv middleware, which runs
// inside `handler` — so we set Cache-Control here, BEFORE delegating, by patching
// the response for sprite requests. Sprite filenames are stable but content can
// change on a package bump, so cache long + revalidate (not `immutable`).
import http from 'node:http';
import { handler } from './build/handler.js';

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const SPRITE = /^\/npc\/[^/]+\.png$/;

const server = http.createServer((req, res) => {
	if (SPRITE.test(req.url?.split('?')[0] ?? '')) {
		res.setHeader('Cache-Control', 'public, max-age=2592000, must-revalidate');
	} else {
		// Pages and __data.json must always revalidate (a 304 via the ETag is
		// cheap). Prerendered HTML ships Last-Modified but no Cache-Control, so
		// browsers heuristic-cache it and serve stale pages after a deploy until
		// a hard refresh. Hashed /_app/immutable/* assets are unaffected — sirv
		// overrides this with max-age=1y immutable.
		res.setHeader('Cache-Control', 'no-cache');
	}
	handler(req, res);
});

server.listen(PORT, HOST, () => {
	console.log(`bestiary server listening on http://${HOST}:${PORT}`);
});
