// Lightweight client-side search over the prebuilt index. Each item has a
// lowercased haystack `h` (name + aliases + model hash). We score so that
// name-prefix and whole-word matches rank above mid-string substring hits,
// and multi-word queries must match every token (AND).

function tokenize(q) {
	return q.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

function scoreItem(item, tokens) {
	const name = item.n.toLowerCase();
	const hay = item.h;
	let score = 0;
	for (const tok of tokens) {
		const inName = name.indexOf(tok);
		const inHay = hay.indexOf(tok);
		if (inName === 0) score += 100; // name starts with token
		else if (inName > 0 && /\s/.test(name[inName - 1])) score += 60; // word start in name
		else if (inName > 0) score += 30; // somewhere in name
		else if (hay.startsWith(tok)) score += 20;
		else if (inHay >= 0) score += 10; // alias/hash only
		else return -1; // token missing → not a match
	}
	// Tie-breaker: shorter names feel more "exact".
	return score - name.length * 0.05;
}

export function search(index, query, limit = 0) {
	const tokens = tokenize(query);
	if (!tokens.length) return index;
	const scored = [];
	for (const item of index) {
		const s = scoreItem(item, tokens);
		if (s >= 0) scored.push({ item, s });
	}
	scored.sort((a, b) => b.s - a.s || a.item.n.localeCompare(b.item.n));
	const out = scored.map((x) => x.item);
	return limit ? out.slice(0, limit) : out;
}
