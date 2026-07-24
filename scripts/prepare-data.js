// Build-time data step: read the @geptyro/gw1-bestiary npm package, copy its
// sprites into static/npc/, and emit a slim search-ready dataset into
// src/lib/generated/. Keeping this out of the committed tree means the site
// always tracks whatever package version is installed (see package.json).
//
// Run automatically by `npm run dev` / `npm run build` via the prepare-data script.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { FACET_KEYS, slugify } from '../src/lib/facets.js';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Resolve the package via its package.json so we don't depend on a "main".
const pkgJson = require.resolve('@geptyro/gw1-bestiary/package.json');
const pkgDir = path.dirname(pkgJson);
const pkgVersion = JSON.parse(fs.readFileSync(pkgJson, 'utf8')).version;

const jsonlPath = path.join(pkgDir, 'npc.jsonl');
const spriteSrcDir = path.join(pkgDir, 'npc');

const genDir = path.join(root, 'src', 'lib', 'generated');
const spriteDstDir = path.join(root, 'static', 'npc');

// Coerce a value into a clean string array (the package facet fields).
function arr(v) {
	if (!Array.isArray(v)) return [];
	return v.map((x) => String(x).trim()).filter(Boolean);
}

function parseJsonl(text) {
	const out = [];
	for (const line of text.split('\n')) {
		const t = line.trim();
		if (!t) continue;
		out.push(JSON.parse(t));
	}
	return out;
}

// Flatten the package entry into exactly what the UI needs. Aliases come from
// every wiki link's `names` (so searching "Drech Galumph" finds the shared
// "Marrow Scarab" mesh). The canonical title stays first / authoritative.
function toRecord(e) {
	const aliasSet = new Set();
	const links = Array.isArray(e.links) ? e.links : [];
	for (const l of links) {
		for (const n of l.names || []) if (n) aliasSet.add(n);
		if (l.title) aliasSet.add(l.title);
	}
	const primary = e.name || e.title || '';
	aliasSet.delete(primary);

	// Taxonomy facets are intrinsic NPC properties built upstream by the
	// gw1-bestiary package (from the wiki infobox). Read them straight through;
	// fall back to empty so the site still works against an un-enriched package.
	const facets = {
		type: arr(e.types),
		affiliation: arr(e.affiliations),
		profession: arr(e.professions),
		region: arr(e.regions),
		campaign: arr(e.campaigns)
	};

	return {
		id: e.id,
		model: e.model,
		name: primary,
		sprite: `/npc/${e.model}.png`,
		wiki: e.wiki || links[0]?.url || '',
		aliases: [...aliasSet],
		facets,
		// Each link becomes a preview card: `image` is the wiki photo (the
		// Special:FilePath URL), `article` links the readable wiki page (built
		// from the title, since `url` points at the raw image file). Skills are
		// per-link — one mesh is reused by many creatures, each with its own bar.
		// Icons + skill articles are hotlinked from the wiki.
		links: links.map((l) => ({
			title: l.title,
			image: l.url,
			article: l.title
				? `https://wiki.guildwars.com/wiki/${encodeURIComponent(l.title.replace(/ /g, '_'))}`
				: l.url,
			skills: mapSkills(l.skills)
		}))
	};
}

// Attach hotlinked icon + article URLs to each {name, elite} skill.
function mapSkills(skills) {
	if (!Array.isArray(skills)) return [];
	return skills.map((s) => ({
		name: s.name,
		elite: !!s.elite,
		icon: `https://wiki.guildwars.com/wiki/Special:FilePath/${encodeURIComponent(s.name)}.jpg`,
		article: `https://wiki.guildwars.com/wiki/${encodeURIComponent(s.name.replace(/ /g, '_'))}`
	}));
}

async function main() {
	const raw = await fsp.readFile(jsonlPath, 'utf8');
	const entries = parseJsonl(raw);
	const records = entries.map(toRecord).sort((a, b) => a.name.localeCompare(b.name));

	await fsp.mkdir(genDir, { recursive: true });

	// Full dataset (used by detail pages + as the search source).
	await fsp.writeFile(path.join(genDir, 'npc.json'), JSON.stringify(records));

	// A tiny search index keeps the client search payload small: lowercased
	// haystack of name + aliases + model hash, keyed by model. `f` carries the
	// facet values so the compendium can filter without loading the full dataset.
	const index = records.map((r) => ({
		m: r.model,
		n: r.name,
		s: r.sprite,
		h: [r.name, ...r.aliases, r.model].join(' · ').toLowerCase(),
		f: r.facets
	}));
	await fsp.writeFile(path.join(genDir, 'search-index.json'), JSON.stringify(index));

	// Available filter values per facet, with counts, sorted by frequency. Drives
	// the filter UI and the facet landing pages.
	const facetIndex = {};
	for (const key of FACET_KEYS) {
		const counts = new Map();
		for (const r of records) {
			for (const v of r.facets[key]) counts.set(v, (counts.get(v) || 0) + 1);
		}
		facetIndex[key] = [...counts.entries()]
			.map(([value, count]) => ({ value, count, slug: slugify(value) }))
			.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
	}
	await fsp.writeFile(path.join(genDir, 'facets.json'), JSON.stringify(facetIndex));

	await fsp.writeFile(
		path.join(genDir, 'meta.json'),
		JSON.stringify({ count: records.length, packageVersion: pkgVersion })
	);

	// Copy sprites. Skip-if-unchanged keeps re-runs fast during dev.
	await fsp.mkdir(spriteDstDir, { recursive: true });
	let copied = 0;
	for (const r of records) {
		const src = path.join(spriteSrcDir, `${r.model}.png`);
		const dst = path.join(spriteDstDir, `${r.model}.png`);
		if (!fs.existsSync(src)) continue;
		const sStat = fs.statSync(src);
		const dStat = fs.existsSync(dst) ? fs.statSync(dst) : null;
		if (!dStat || dStat.size !== sStat.size) {
			await fsp.copyFile(src, dst);
			copied++;
		}
	}

	console.log(
		`prepare-data: ${records.length} NPCs from @geptyro/gw1-bestiary@${pkgVersion}, ${copied} sprite(s) copied`
	);
}

main().catch((err) => {
	console.error('prepare-data failed:', err);
	process.exit(1);
});
