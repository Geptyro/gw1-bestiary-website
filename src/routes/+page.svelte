<script>
	import index from '$lib/generated/search-index.json';
	import facetIndex from '$lib/generated/facets.json';
	import meta from '$lib/generated/meta.json';
	import { search } from '$lib/search.js';
	import { FACET_KEYS, FACET_LABEL, slugify } from '$lib/facets.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	const PER_PAGE = 120;

	// All state lives in the URL: ?q= for text, and ?type=/?affiliation=/… for
	// facets (slug values, comma-separated). This makes every view shareable and
	// keeps the header search box (which writes ?q=) in sync for free.
	//
	// The page is prerendered, so query params don't exist at build time — read
	// them only in the browser and fall back to "no filters" for the static HTML.
	let params = $derived(browser ? page.url.searchParams : new URLSearchParams());
	let q = $derived(params.get('q') || '');
	let activeFilters = $derived.by(() => {
		const f = {};
		for (const key of FACET_KEYS) {
			const raw = params.get(key);
			f[key] = raw ? new Set(raw.split(',').filter(Boolean)) : new Set();
		}
		return f;
	});
	let pageNum = $derived(Math.max(1, parseInt(params.get('page') || '1', 10) || 1));

	let anyFilter = $derived(FACET_KEYS.some((k) => activeFilters[k].size > 0));
	let showAllFacets = $state(false);

	function setParams(mut, { resetPage = true } = {}) {
		const p = new URLSearchParams(page.url.searchParams);
		mut(p);
		if (resetPage) p.delete('page');
		const qs = p.toString();
		goto(qs ? `/?${qs}` : '/', { replaceState: true, keepFocus: true, noScroll: true });
	}

	function toggleFacet(key, slug) {
		setParams((p) => {
			const cur = new Set((p.get(key) || '').split(',').filter(Boolean));
			cur.has(slug) ? cur.delete(slug) : cur.add(slug);
			if (cur.size) p.set(key, [...cur].join(','));
			else p.delete(key);
		});
	}

	function clearAll() {
		setParams((p) => {
			for (const k of FACET_KEYS) p.delete(k);
		});
	}

	function goPage(n) {
		setParams(
			(p) => {
				if (n > 1) p.set('page', String(n));
				else p.delete('page');
			},
			{ resetPage: false }
		);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	// Text search first, then AND across facets (within a facet, OR the values).
	let results = $derived.by(() => {
		let list = search(index, q);
		if (anyFilter) {
			list = list.filter((it) => {
				for (const key of FACET_KEYS) {
					const want = activeFilters[key];
					if (!want.size) continue;
					const have = (it.f?.[key] || []).map(slugify);
					if (!have.some((v) => want.has(v))) return false;
				}
				return true;
			});
		}
		return list;
	});

	let pageCount = $derived(Math.max(1, Math.ceil(results.length / PER_PAGE)));
	let curPage = $derived(Math.min(pageNum, pageCount));
	let shown = $derived(results.slice((curPage - 1) * PER_PAGE, curPage * PER_PAGE));

	// How many filter values to show per facet before "show all".
	const TOP_N = 8;
</script>

<svelte:head>
	<title>Guild Wars Bestiary — a searchable compendium of GW1 creatures</title>
</svelte:head>

<section class="hero">
	<h1>The Bestiary of Tyria</h1>
	<p class="lede">
		Every creature and NPC of Guild Wars, drawn from the original game models —
		search by name above, or sift the legions by type, affiliation, profession, and region.
	</p>
</section>

<section class="filters" aria-label="Filters">
	<div class="filters-head">
		<h2>Filter</h2>
		<button class="toggle" onclick={() => (showAllFacets = !showAllFacets)}>
			{showAllFacets ? 'Show fewer' : 'Show all values'}
		</button>
		{#if anyFilter || q}
			<button class="clear" onclick={clearAll}>Clear filters ✕</button>
		{/if}
	</div>

	{#each FACET_KEYS as key (key)}
		{@const values = showAllFacets ? facetIndex[key] : facetIndex[key].slice(0, TOP_N)}
		{#if facetIndex[key].length}
			<div class="facet">
				<span class="facet-name">{FACET_LABEL[key].many}</span>
				<div class="chips">
					{#each values as v (v.slug)}
						<button
							class="chip"
							class:on={activeFilters[key].has(v.slug)}
							onclick={() => toggleFacet(key, v.slug)}
							aria-pressed={activeFilters[key].has(v.slug)}
						>
							{v.value}<span class="cnt">{v.count}</span>
						</button>
					{/each}
					{#if !showAllFacets && facetIndex[key].length > TOP_N}
						<a class="more" href="/{key}/">+{facetIndex[key].length - TOP_N} more →</a>
					{/if}
				</div>
			</div>
		{/if}
	{/each}
</section>

<p class="count">
	{#if q || anyFilter}
		{results.length} of {meta.count} entries match
	{:else}
		Browsing all {meta.count} entries
	{/if}
</p>

{#if pageCount > 1}
	<div class="pager">
		<button onclick={() => goPage(1)} disabled={curPage === 1}>« First</button>
		<button onclick={() => goPage(curPage - 1)} disabled={curPage === 1}>‹ Prev</button>
		<span>Page {curPage} of {pageCount}</span>
		<button onclick={() => goPage(curPage + 1)} disabled={curPage === pageCount}>Next ›</button>
		<button onclick={() => goPage(pageCount)} disabled={curPage === pageCount}>Last »</button>
	</div>
{/if}

{#if results.length === 0}
	<p class="empty">No creature answers that call.</p>
{:else}
	<ul class="grid">
		{#each shown as it (it.m)}
			<li>
				<a class="card" href="/npc/{it.m}/" title={it.n}>
					<div class="frame">
						<img src={it.s} alt={it.n} loading="lazy" width="512" height="512" />
					</div>
					<span class="name">{it.n}</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.hero {
		text-align: center;
		margin-bottom: 22px;
	}
	h1 {
		font-size: clamp(28px, 5vw, 44px);
		color: var(--gold-bright);
		margin: 0 0 10px;
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
	}
	.lede {
		max-width: 660px;
		margin: 0 auto;
		color: #c8bb98;
		font-size: 18px;
		font-style: italic;
	}

	.filters {
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.05), rgba(0, 0, 0, 0.12));
		border: 1px solid var(--bronze);
		border-radius: 6px;
		padding: 14px 16px;
		margin-bottom: 18px;
	}
	.filters-head {
		display: flex;
		align-items: center;
		gap: 14px;
		margin-bottom: 8px;
	}
	.filters-head h2 {
		font-size: 13px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--bronze);
		margin: 0;
	}
	.toggle,
	.clear {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.05em;
		background: none;
		border: 1px solid var(--rule);
		color: #b7a883;
		border-radius: 2px;
		padding: 4px 10px;
		cursor: pointer;
	}
	.clear {
		margin-left: auto;
		color: var(--accent);
		border-color: var(--accent);
	}
	.toggle:hover {
		border-color: var(--gold);
		color: var(--gold-bright);
	}

	.facet {
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 10px;
		align-items: start;
		padding: 7px 0;
		border-top: 1px dotted var(--rule);
	}
	.facet-name {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.06em;
		color: var(--gold);
		padding-top: 5px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'EB Garamond', serif;
		font-size: 14px;
		color: #e8dcc0;
		background: rgba(201, 162, 39, 0.08);
		border: 1px solid var(--rule);
		border-radius: 14px;
		padding: 3px 10px;
		cursor: pointer;
		transition: border-color 0.1s ease, background 0.1s ease;
	}
	.chip:hover {
		border-color: var(--gold);
	}
	.chip.on {
		background: linear-gradient(180deg, var(--gold-bright), var(--gold));
		border-color: var(--gold-bright);
		color: var(--ink);
		font-weight: 500;
	}
	.cnt {
		font-size: 11px;
		opacity: 0.7;
	}
	.chip.on .cnt {
		opacity: 0.85;
	}
	.more {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		color: var(--bronze);
		padding: 3px 6px;
	}
	.more:hover {
		color: var(--gold-bright);
	}

	@media (max-width: 560px) {
		.facet {
			grid-template-columns: 1fr;
			gap: 4px;
		}
	}

	.count {
		color: #9a8c6c;
		font-size: 15px;
		margin: 0 0 16px;
		text-align: center;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		justify-content: center;
		margin: 0 0 24px;
		color: #b7a883;
		font-size: 15px;
	}
	.pager button {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.05em;
		color: #e8dcc0;
		background: linear-gradient(180deg, #2a2114, #1d1610);
		border: 1px solid var(--bronze);
		border-radius: 2px;
		padding: 7px 12px;
		cursor: pointer;
	}
	.pager button:hover:not(:disabled) {
		border-color: var(--gold);
		color: var(--gold-bright);
	}
	.pager button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.empty {
		text-align: center;
		font-style: italic;
		color: #9a8c6c;
		font-size: 20px;
		padding: 60px 0;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px;
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		color: inherit;
		padding: 10px 10px 12px;
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.06), rgba(239, 228, 201, 0.02));
		border: 1px solid var(--rule);
		border-radius: 4px;
		transition:
			transform 0.12s ease,
			border-color 0.12s ease,
			box-shadow 0.12s ease;
	}
	.card:hover {
		transform: translateY(-3px);
		border-color: var(--gold);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
	}
	.frame {
		width: 100%;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 50% 60%, rgba(201, 162, 39, 0.1), transparent 62%),
			linear-gradient(180deg, #211b13, #16110b);
		border: 1px solid var(--bronze);
		border-radius: 3px;
		overflow: hidden;
	}
	.frame img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
	}
	.name {
		font-family: 'Cinzel', serif;
		font-size: 13px;
		text-align: center;
		color: var(--gold-bright);
		line-height: 1.25;
	}
</style>
