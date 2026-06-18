// Shared facet config — used by the build script, the filter UI, and the facet
// landing pages so the labels, ordering, and slugs stay in sync everywhere.

export const FACET_KEYS = ['type', 'affiliation', 'profession', 'region', 'campaign'];

// Display labels for each facet, singular + plural (for headings).
export const FACET_LABEL = {
	type: { one: 'Type', many: 'Types', noun: 'type' },
	affiliation: { one: 'Affiliation', many: 'Affiliations', noun: 'affiliation' },
	profession: { one: 'Profession', many: 'Professions', noun: 'profession' },
	region: { one: 'Region', many: 'Regions', noun: 'region' },
	campaign: { one: 'Campaign', many: 'Campaigns', noun: 'campaign' }
};

// URL-safe slug, e.g. "Order of the Sunspears" -> "order-of-the-sunspears".
export function slugify(s) {
	return String(s)
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
