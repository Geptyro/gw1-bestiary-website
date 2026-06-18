<script>
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.label.many} — Guild Wars Bestiary</title>
</svelte:head>

<a class="back" href="/">‹ Back to the compendium</a>

<header class="head">
	<p class="kicker">Browse by {data.label.noun}</p>
	<h1>{data.label.many}</h1>
	<p class="sub">{data.values.length} {data.label.noun}s across the bestiary</p>
</header>

<ul class="vals">
	{#each data.values as v (v.slug)}
		<li>
			<a href="/{data.facet}/{v.slug}/">
				<span class="v">{v.value}</span>
				<span class="c">{v.count}</span>
			</a>
		</li>
	{/each}
</ul>

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
	.vals {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 8px;
	}
	.vals a {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		color: #ecdfc0;
		padding: 10px 14px;
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.06), rgba(239, 228, 201, 0.02));
		border: 1px solid var(--rule);
		border-radius: 4px;
		transition: border-color 0.1s ease, transform 0.1s ease;
	}
	.vals a:hover {
		border-color: var(--gold);
		transform: translateY(-2px);
	}
	.v {
		font-family: 'Cinzel', serif;
		font-size: 15px;
		color: var(--gold-bright);
	}
	.c {
		font-size: 13px;
		color: var(--bronze);
	}
</style>
