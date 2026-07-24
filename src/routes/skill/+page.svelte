<script>
	let { data } = $props();

	// Canonical profession order; monster skills and profession-less common
	// skills share one trailing bucket.
	const MONSTER_COMMON = 'Monster & Common';
	const PROF_ORDER = [
		'Warrior',
		'Ranger',
		'Monk',
		'Necromancer',
		'Mesmer',
		'Elementalist',
		'Assassin',
		'Ritualist',
		'Paragon',
		'Dervish',
		MONSTER_COMMON
	];
	const bucket = (p) => (PROF_ORDER.includes(p) ? p : MONSTER_COMMON);

	// Local type-to-filter — 1,146 entries is trivial to filter client-side.
	// Matches name, attribute, or profession; empty groups disappear.
	// Each profession splits into attribute subsections (attribute-less last),
	// and within a subsection elites lead, then alphabetical.
	let q = $state('');
	let groups = $derived.by(() => {
		const t = q.trim().toLowerCase();
		const by = new Map(PROF_ORDER.map((p) => [p, new Map()]));
		for (const s of data.skills) {
			if (
				t &&
				!s.name.toLowerCase().includes(t) &&
				!s.attribute.toLowerCase().includes(t) &&
				!s.profession.toLowerCase().includes(t)
			)
				continue;
			const attrs = by.get(bucket(s.profession));
			if (!attrs.has(s.attribute)) attrs.set(s.attribute, []);
			attrs.get(s.attribute).push(s);
		}
		return PROF_ORDER.map((p) => {
			const attrs = [...by.get(p).entries()]
				.sort((x, y) => (x[0] || '￿').localeCompare(y[0] || '￿'))
				.map(([a, skills]) => ({
					a,
					skills: skills.sort((x, y) => y.elite - x.elite || x.name.localeCompare(y.name))
				}));
			return { p, count: attrs.reduce((n, ag) => n + ag.skills.length, 0), attrs };
		}).filter((g) => g.count);
	});
	let shownCount = $derived(groups.reduce((n, g) => n + g.count, 0));
</script>

<svelte:head>
	<title>Skills — Guild Wars Bestiary</title>
	<meta
		name="description"
		content="Every monster skill in Guild Wars — find which creatures carry a given skill."
	/>
</svelte:head>

<a class="back" href="/">‹ Back to the compendium</a>

<header class="head">
	<p class="kicker">Browse by skill</p>
	<h1>Skills</h1>
	<p class="sub">{data.skills.length} skills known to the bestiary — pick one to see every creature that carries it</p>
</header>

<input
	class="filter"
	type="search"
	placeholder="Filter skills… (e.g. Meteor Shower)"
	bind:value={q}
	aria-label="Filter skills"
/>

{#if shownCount === 0}
	<p class="empty">No skill answers that call.</p>
{:else}
	{#each groups as g (g.p)}
		<section class="group">
			<h2>{g.p} <span class="gc">{g.count}</span></h2>
			{#each g.attrs as ag (ag.a)}
				{#if ag.a || g.attrs.length > 1}
					<h3>{ag.a || 'No attribute'} <span class="gc">{ag.skills.length}</span></h3>
				{/if}
				<ul class="vals">
					{#each ag.skills as s (s.slug)}
						<li>
							<a href="/skill/{s.slug}/" class:elite={s.elite}>
								<span class="ico">
									<img src={s.icon} alt="" loading="lazy" width="64" height="64" />
								</span>
								<span class="v">
									{s.name}{#if s.elite}<span class="star" title="elite"> ★</span>{/if}
								</span>
								<span class="c">{s.count}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/each}
		</section>
	{/each}
{/if}

<style>
	.back {
		display: inline-block;
		font-family: 'Cinzel', serif;
		font-size: 13px;
		letter-spacing: 0.06em;
		color: #b7a883;
		margin-bottom: 18px;
	}
	.back:hover {
		color: var(--gold-bright);
	}
	.head {
		margin-bottom: 18px;
	}
	.kicker {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--bronze);
		margin: 0 0 4px;
	}
	h1 {
		font-size: clamp(28px, 5vw, 40px);
		color: var(--gold-bright);
		margin: 0;
	}
	.sub {
		color: #9a8c6c;
		font-size: 15px;
		margin: 6px 0 0;
	}

	.filter {
		width: 100%;
		max-width: 420px;
		font-family: 'EB Garamond', serif;
		font-size: 16px;
		color: #ecdfc0;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.12));
		border: 1px solid var(--bronze);
		border-radius: 4px;
		padding: 9px 14px;
		margin-bottom: 18px;
	}
	.filter:focus {
		outline: none;
		border-color: var(--gold);
	}
	.filter::placeholder {
		color: #9a8c6c;
	}

	.group {
		margin-bottom: 22px;
	}
	.group h2 {
		font-family: 'Cinzel', serif;
		font-size: 15px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		border-bottom: 1px solid var(--rule);
		padding-bottom: 6px;
		margin: 0 0 10px;
	}
	.gc {
		font-size: 12px;
		color: var(--bronze);
		letter-spacing: 0;
	}
	.group h3 {
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.08em;
		color: #b7a883;
		margin: 12px 0 8px;
	}

	.vals {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 8px;
	}
	.vals a {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #ecdfc0;
		padding: 6px 12px 6px 6px;
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.06), rgba(239, 228, 201, 0.02));
		border: 1px solid var(--rule);
		border-radius: 4px;
		transition: border-color 0.1s ease, transform 0.1s ease;
	}
	.vals a:hover {
		border-color: var(--gold);
		transform: translateY(-2px);
	}
	.ico {
		flex: none;
		width: 36px;
		height: 36px;
		border: 1px solid var(--bronze);
		border-radius: 3px;
		overflow: hidden;
		background: #14100a;
	}
	.vals a.elite .ico {
		border-color: var(--gold-bright);
	}
	.ico img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.v {
		flex: 1;
		font-family: 'Cinzel', serif;
		font-size: 14px;
		line-height: 1.25;
		color: var(--gold-bright);
	}
	.star {
		color: var(--gold-bright);
	}
	.c {
		font-size: 13px;
		color: var(--bronze);
	}

	.empty {
		text-align: center;
		font-style: italic;
		color: #9a8c6c;
		font-size: 20px;
		padding: 60px 0;
	}
</style>
