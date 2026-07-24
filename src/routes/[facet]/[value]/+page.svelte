<script>
	import NpcGrid from '$lib/NpcGrid.svelte';

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

<NpcGrid items={data.npcs} />

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
</style>
