import { error } from '@sveltejs/kit';
import records from '$lib/generated/npc.json';

export const prerender = true;

// Enumerate every NPC so the static adapter prerenders one page per creature.
export function entries() {
	return records.map((r) => ({ hash: r.model }));
}

// Server-only load: keeps the full npc.json dataset out of the client bundle —
// prerendering serializes just this page's record for client-side navigation.
export function load({ params }) {
	const npc = records.find((r) => r.model === params.hash);
	if (!npc) throw error(404, 'No such creature');
	return { npc };
}
