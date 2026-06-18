import { error } from '@sveltejs/kit';
import records from '$lib/generated/npc.json';

export const prerender = true;

// Enumerate every NPC so the static adapter prerenders one page per creature.
export function entries() {
	return records.map((r) => ({ hash: r.model }));
}

export function load({ params }) {
	const npc = records.find((r) => r.model === params.hash);
	if (!npc) throw error(404, 'No such creature');

	// "Also appears as" — the duplicate meshes' hashes, plus any sibling entries
	// that share this exact mesh aren't separate records (they're folded), so we
	// only surface the duplicate hashes here.
	return { npc };
}
