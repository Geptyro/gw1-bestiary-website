<script>
	import NpcGrid from '$lib/NpcGrid.svelte';

	let { data } = $props();
	let skill = $derived(data.skill);
</script>

<svelte:head>
	<title>{skill.name} — creatures with this skill — Guild Wars Bestiary</title>
	<meta
		name="description"
		content="Every Guild Wars creature that uses {skill.name}: {skill.npcs.length} in the bestiary."
	/>
</svelte:head>

<a class="back" href="/skill/">‹ All skills</a>

<header class="head">
	<span class="ico" class:elite={skill.elite}>
		<img src={skill.icon} alt="" width="64" height="64" />
		{#if skill.elite}<span class="elite-badge" aria-label="elite">★</span>{/if}
	</span>
	<div>
		<p class="kicker">
			{[skill.profession || 'Monster / common', skill.attribute, skill.elite ? 'Elite' : '']
				.filter(Boolean)
				.join(' — ')}
		</p>
		<h1>{skill.name}</h1>
		<p class="sub">
			Carried by {skill.npcs.length}
			{skill.npcs.length === 1 ? 'creature' : 'creatures'} —
			<a class="wiki" href={skill.article} target="_blank" rel="noopener noreferrer">
				read about it on the wiki ↗
			</a>
		</p>
	</div>
</header>

<NpcGrid items={skill.npcs} />

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
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 22px;
	}
	.ico {
		position: relative;
		flex: none;
		width: 72px;
		height: 72px;
		border: 1px solid var(--bronze);
		border-radius: 4px;
		overflow: hidden;
		background: #14100a;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	}
	.ico.elite {
		border-color: var(--gold-bright);
		box-shadow: 0 0 0 1px var(--gold), 0 4px 12px rgba(201, 162, 39, 0.35);
	}
	.ico img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.elite-badge {
		position: absolute;
		top: 2px;
		right: 4px;
		font-size: 14px;
		color: var(--gold-bright);
		text-shadow: 0 0 3px #000, 0 0 3px #000;
		line-height: 1;
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
		font-size: clamp(26px, 5vw, 38px);
		color: var(--gold-bright);
		margin: 0;
	}
	.sub {
		color: #9a8c6c;
		font-size: 15px;
		margin: 6px 0 0;
	}
	.wiki {
		color: #b7a883;
	}
	.wiki:hover {
		color: var(--gold-bright);
	}
</style>
