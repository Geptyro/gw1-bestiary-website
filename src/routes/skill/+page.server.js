import skills from '$lib/generated/skills.json';

export const prerender = true;

// Server-only load: strips the per-creature lists so the index ships just
// name/slug/elite/icon/count — the full lists live on the detail pages.
export function load() {
	return {
		skills: skills.map(({ name, slug, elite, icon, profession, attribute, npcs }) => ({
			name,
			slug,
			elite,
			icon,
			profession,
			attribute,
			count: npcs.length
		}))
	};
}
