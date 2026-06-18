import { error } from '@sveltejs/kit';
import facetIndex from '$lib/generated/facets.json';
import { FACET_KEYS, FACET_LABEL } from '$lib/facets.js';

export const prerender = true;

// One index page per facet: /type/, /affiliation/, /profession/, /region/, /campaign/.
export function entries() {
	return FACET_KEYS.map((facet) => ({ facet }));
}

export function load({ params }) {
	const facet = params.facet;
	if (!FACET_KEYS.includes(facet)) throw error(404, 'Unknown facet');
	return {
		facet,
		label: FACET_LABEL[facet],
		values: facetIndex[facet]
	};
}
