<script>
	import { FACET_KEYS, FACET_LABEL, slugify } from '$lib/facets.js';

	let { data } = $props();
	let npc = $derived(data.npc);

	// Facets present on this NPC, as {key, label, values:[{value, slug}]}.
	let facetRows = $derived(
		FACET_KEYS.map((key) => ({
			key,
			label: FACET_LABEL[key].one,
			values: (npc.facets?.[key] || []).map((v) => ({ value: v, slug: slugify(v) }))
		})).filter((row) => row.values.length)
	);
</script>

<svelte:head>
	<title>{npc.name} — Guild Wars Bestiary</title>
	<meta name="description" content="{npc.name} — a creature of Guild Wars, model {npc.model}." />
</svelte:head>

<a class="back" href="/">‹ Back to the compendium</a>

<article class="scroll">
	<div class="portrait">
		<div class="frame">
			<img src={npc.sprite} alt={npc.name} width="512" height="512" />
		</div>
		<span class="hash">{npc.model}</span>
	</div>

	<div class="info">
		<header>
			<p class="kicker">Guild Wars Bestiary</p>
			<h1>{npc.name}</h1>
		</header>

		{#if facetRows.length}
			<section class="taxonomy">
				{#each facetRows as row (row.key)}
					<div class="tax-row">
						<span class="tax-label">{row.label}</span>
						<span class="tax-vals">
							{#each row.values as v (v.slug)}
								<a class="tag" href="/{row.key}/{v.slug}/">{v.value}</a>
							{/each}
						</span>
					</div>
				{/each}
			</section>
		{/if}

		{#if npc.aliases.length}
			<section>
				<h2>Also known as</h2>
				<ul class="aliases">
					{#each npc.aliases as a (a)}
						<li>{a}</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if npc.links.length}
			<section>
				<h2>{npc.links.length === 1 ? 'On the Guild Wars Wiki' : 'Creatures sharing this form'}</h2>
				<ul class="creatures">
					{#each npc.links as l (l.article)}
						<li class="creature">
							<a class="wiki-card" href={l.article} target="_blank" rel="noopener noreferrer">
								<span class="thumb">
									<img src={l.image} alt={l.title} loading="lazy" />
								</span>
								<span class="wiki-name">{l.title}<span class="ext"> ↗</span></span>
							</a>

							{#if l.skills?.length}
								<div class="bar">
									{#each l.skills as sk (sk.name)}
										<a
											class="skill"
											class:elite={sk.elite}
											href={sk.article}
											target="_blank"
											rel="noopener noreferrer"
											title={sk.elite ? `${sk.name} (elite)` : sk.name}
										>
											<span class="skill-ico">
												<img src={sk.icon} alt={sk.name} loading="lazy" width="64" height="64" />
												{#if sk.elite}<span class="elite-badge" aria-label="elite">★</span>{/if}
											</span>
											<span class="skill-name">{sk.name}</span>
										</a>
									{/each}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</article>

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

	.scroll {
		display: grid;
		grid-template-columns: minmax(260px, 380px) 1fr;
		gap: clamp(24px, 4vw, 48px);
		align-items: start;
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.05), rgba(0, 0, 0, 0.1));
		border: 1px solid var(--bronze);
		border-radius: 6px;
		padding: clamp(20px, 4vw, 40px);
		box-shadow: 0 10px 40px var(--shadow);
	}
	@media (max-width: 700px) {
		.scroll {
			grid-template-columns: 1fr;
		}
	}

	.portrait {
		position: sticky;
		top: 90px;
		text-align: center;
	}
	.frame {
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 50% 58%, rgba(201, 162, 39, 0.14), transparent 64%),
			linear-gradient(180deg, #221b13, #14100a);
		border: 2px solid var(--gold);
		border-radius: 4px;
		box-shadow:
			inset 0 0 40px rgba(0, 0, 0, 0.6),
			0 6px 24px var(--shadow);
		overflow: hidden;
	}
	.frame img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.6));
	}
	.hash {
		display: inline-block;
		margin-top: 12px;
		font-family: ui-monospace, monospace;
		font-size: 13px;
		color: var(--bronze);
		letter-spacing: 0.05em;
	}

	.info header {
		border-bottom: 1px solid var(--rule);
		padding-bottom: 14px;
		margin-bottom: 8px;
	}
	.kicker {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--bronze);
		margin: 0 0 6px;
	}
	h1 {
		font-size: clamp(28px, 4vw, 40px);
		color: var(--gold-bright);
		margin: 0;
	}

	section {
		margin-top: 22px;
	}
	h2 {
		font-size: 13px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--bronze);
		margin: 0 0 10px;
	}

	.taxonomy {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 18px;
		padding-bottom: 4px;
	}
	.tax-row {
		display: grid;
		grid-template-columns: 92px 1fr;
		gap: 10px;
		align-items: start;
	}
	.tax-label {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--bronze);
		padding-top: 4px;
	}
	.tax-vals {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-size: 14px;
		color: var(--gold-bright);
		background: rgba(201, 162, 39, 0.1);
		border: 1px solid var(--rule);
		border-radius: 14px;
		padding: 3px 11px;
		transition: border-color 0.1s ease;
	}
	.tag:hover {
		border-color: var(--gold);
	}

	.aliases {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.aliases li {
		font-size: 15px;
		color: #ecdfc0;
		background: rgba(201, 162, 39, 0.1);
		border: 1px solid var(--rule);
		border-radius: 14px;
		padding: 4px 12px;
	}

	/* One row per "also known as" creature: portrait card + its own skill bar. */
	.creatures {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.creature {
		display: grid;
		grid-template-columns: 132px 1fr;
		gap: 16px;
		align-items: start;
		padding: 12px;
		background: linear-gradient(180deg, rgba(239, 228, 201, 0.05), rgba(0, 0, 0, 0.08));
		border: 1px solid var(--rule);
		border-radius: 5px;
	}
	@media (max-width: 560px) {
		.creature {
			grid-template-columns: 1fr;
		}
	}

	.wiki-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		color: inherit;
	}
	.wiki-card:hover .thumb {
		border-color: var(--gold);
	}
	.thumb {
		width: 100%;
		aspect-ratio: 1;
		display: block;
		background: linear-gradient(180deg, #211b13, #14100a);
		border: 1px solid var(--bronze);
		border-radius: 3px;
		overflow: hidden;
		transition: border-color 0.12s ease;
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.wiki-name {
		font-family: 'Cinzel', serif;
		font-size: 13px;
		line-height: 1.25;
		color: var(--gold-bright);
		text-align: center;
	}
	.wiki-name .ext {
		color: var(--bronze);
		font-size: 11px;
	}

	/* Skill bar for one creature. */
	.bar {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
		gap: 8px;
	}
	.skill {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		color: inherit;
	}
	.skill-ico {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid var(--bronze);
		border-radius: 3px;
		overflow: hidden;
		background: #14100a;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
		transition: border-color 0.1s ease, transform 0.1s ease;
	}
	.skill:hover .skill-ico {
		transform: translateY(-2px);
		border-color: var(--gold);
	}
	.skill-ico img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.skill.elite .skill-ico {
		border-color: var(--gold-bright);
		box-shadow: 0 0 0 1px var(--gold), 0 2px 8px rgba(201, 162, 39, 0.4);
	}
	.elite-badge {
		position: absolute;
		top: 1px;
		right: 2px;
		font-size: 12px;
		color: var(--gold-bright);
		text-shadow: 0 0 3px #000, 0 0 3px #000;
		line-height: 1;
	}
	.skill-name {
		font-size: 11px;
		text-align: center;
		color: #d8cbab;
		line-height: 1.2;
	}
	.skill.elite .skill-name {
		color: var(--gold-bright);
	}

</style>
