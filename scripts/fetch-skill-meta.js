// One-time enrichment: fetch profession/attribute/type for every skill in the
// generated skills.json from the official wiki's skill infoboxes, and write the
// result to src/lib/data/skill-meta.json (COMMITTED — GW1 skills never change,
// so this is not part of the build; re-run only if new skills appear upstream).
//
// Usage: node scripts/prepare-data.js && node scripts/fetch-skill-meta.js

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fsp from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const API = 'https://wiki.guildwars.com/api.php';
const BATCH = 50; // anonymous API title limit
const UA = 'gw1-bestiary-website skill-meta fetch (https://github.com/Geptyro/gw1-bestiary-website)';

function infoboxParam(wikitext, name) {
	const m = wikitext.match(new RegExp(`\\|\\s*${name}\\s*=\\s*([^\\n|}]+)`));
	return m ? m[1].trim() : '';
}

async function fetchBatch(titles) {
	const url = new URL(API);
	url.search = new URLSearchParams({
		action: 'query',
		format: 'json',
		redirects: '1',
		prop: 'revisions',
		rvprop: 'content',
		rvslots: 'main',
		titles: titles.join('|')
	}).toString();
	const res = await fetch(url, { headers: { 'User-Agent': UA } });
	if (!res.ok) throw new Error(`wiki API ${res.status}`);
	const json = await res.json();

	// Map requested title -> page title through normalization + redirects.
	const rename = new Map();
	for (const n of json.query.normalized || []) rename.set(n.from, n.to);
	for (const r of json.query.redirects || []) rename.set(r.from, r.to);
	const resolve = (t) => {
		let cur = t;
		for (let i = 0; i < 5 && rename.has(cur); i++) cur = rename.get(cur);
		return cur;
	};

	const byTitle = new Map();
	for (const p of Object.values(json.query.pages || {})) {
		const text = p.revisions?.[0]?.slots?.main?.['*'] || '';
		byTitle.set(p.title, text);
	}

	const out = {};
	for (const t of titles) {
		const text = byTitle.get(resolve(t)) || '';
		out[t] = {
			profession: infoboxParam(text, 'profession'),
			attribute: infoboxParam(text, 'attribute'),
			type: infoboxParam(text, 'type'),
			missing: !text
		};
	}
	return out;
}

async function main() {
	const skills = JSON.parse(
		await fsp.readFile(path.join(root, 'src', 'lib', 'generated', 'skills.json'), 'utf8')
	);
	const names = skills.map((s) => s.name);

	const meta = {};
	for (let i = 0; i < names.length; i += BATCH) {
		const batch = names.slice(i, i + BATCH);
		Object.assign(meta, await fetchBatch(batch));
		console.log(`fetched ${Math.min(i + BATCH, names.length)}/${names.length}`);
		await new Promise((r) => setTimeout(r, 500));
	}

	const missing = Object.entries(meta).filter(([, v]) => v.missing).map(([k]) => k);
	const noProf = Object.entries(meta).filter(([, v]) => !v.missing && !v.profession).length;
	console.log(`missing pages: ${missing.length}`, missing.slice(0, 10));
	console.log(`pages without profession: ${noProf}`);

	const dstDir = path.join(root, 'src', 'lib', 'data');
	await fsp.mkdir(dstDir, { recursive: true });
	await fsp.writeFile(
		path.join(dstDir, 'skill-meta.json'),
		JSON.stringify(meta, null, '\t')
	);
	console.log(`wrote src/lib/data/skill-meta.json (${Object.keys(meta).length} skills)`);
}

main().catch((err) => {
	console.error('fetch-skill-meta failed:', err);
	process.exit(1);
});
