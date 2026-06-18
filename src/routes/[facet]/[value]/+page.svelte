<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.value} ({data.label.one}) — Guild Wars Bestiary</title>
	<meta name="description" content="All Guild Wars creatures and NPCs of {data.label.noun} {data.value}." />
</svelte:head>

<nav class="crumbs">
	<a href="/">Compendium</a>
	<span>›</span>
	<a href="/{data.facet}/">{data.label.many}</a>
	<span>›</span>
	<span class="here">{data.value}</span>
</nav>

<header class="head">
	<p class="kicker">{data.label.one}</p>
	<h1>{data.value}</h1>
	<p class="sub">{data.npcs.length} {data.npcs.length === 1 ? 'creature' : 'creatures'}</p>
</header>

<ul class="grid">
	{#each data.npcs as it (it.m)}
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

<style>
	.crumbs {
		display: flex;
		gap: 8px;
		align-items: center;
		font-family: 'Cinzel', serif;
		font-size: 12px;
		letter-spacing: 0.04em;
		color: var(--bronze);
		margin-bottom: 16px;
	}
	.crumbs a {
		color: #b7a883;
	}
	.crumbs a:hover {
		color: var(--gold-bright);
	}
	.crumbs .here {
		color: var(--gold-bright);
	}

	.head {
		margin-bottom: 22px;
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
