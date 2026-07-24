import { error } from '@sveltejs/kit';
import skills from '$lib/generated/skills.json';

export const prerender = true;

// One page per skill: /skill/meteor-shower/, /skill/panic/, …
export function entries() {
	return skills.map((s) => ({ slug: s.slug }));
}

export function load({ params }) {
	const skill = skills.find((s) => s.slug === params.slug);
	if (!skill) throw error(404, 'Unknown skill');
	return { skill };
}
