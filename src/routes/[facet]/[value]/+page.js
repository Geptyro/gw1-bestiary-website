import { error } from '@sveltejs/kit';
import records from '$lib/generated/npc.json';
import facetIndex from '$lib/generated/facets.json';
import { FACET_KEYS, FACET_LABEL, slugify } from '$lib/facets.js';

export const prerender = true;

// One page per (facet, value): /type/human/, /affiliation/white-mantle/, …
export function entries() {
	const out = [];
	for (const facet of FACET_KEYS) {
		for (const v of facetIndex[facet]) out.push({ facet, value: v.slug });
	}
	return out;
}

export function load({ params }) {
	const { facet, value } = params;
	if (!FACET_KEYS.includes(facet)) throw error(404, 'Unknown facet');

	const entry = facetIndex[facet].find((v) => v.slug === value);
	if (!entry) throw error(404, 'Unknown value');

	// All NPCs whose facet array contains this value (matched by slug so the
	// detail page and the filter use one notion of equality).
	const npcs = records
		.filter((r) => (r.facets?.[facet] || []).some((v) => slugify(v) === value))
		.map((r) => ({ m: r.model, n: r.name, s: r.sprite }));

	return {
		facet,
		label: FACET_LABEL[facet],
		value: entry.value,
		npcs
	};
}
