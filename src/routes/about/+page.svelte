<script>
	import meta from '$lib/generated/meta.json';
</script>

<svelte:head>
	<title>About — Guild Wars Bestiary</title>
</svelte:head>

<a class="back" href="/">‹ Back to the compendium</a>

<article class="prose">
	<h1>About this Bestiary</h1>

	<p>
		This is a searchable compendium of <strong>{meta.count} creatures and NPCs</strong> from
		<em>Guild Wars</em> (2005), each rendered directly from the original game's 3D models and
		textures. Every figure is shown in bind pose against a parchment frame, the way an old
		cartographer's bestiary might catalogue the beasts of Tyria, Cantha, and Elona.
	</p>

	<h2>Searching</h2>
	<p>
		The search box matches on a creature's name and on every alias it carries — many Guild
		Wars foes share a single underlying model, so searching for one boss may surface the shared
		form it was built from. Press <kbd>/</kbd> anywhere to jump to the search box, and
		<kbd>Esc</kbd> to clear it. Click any entry for its full record: aliases, links to the
		official wiki, and the underlying model data.
	</p>

	<h2>Where the data comes from</h2>
	<p>
		The sprites and metadata are published as the open
		<a href="https://github.com/Geptyro/gw1-bestiary" target="_blank" rel="noopener noreferrer"
			>@geptyro/gw1-bestiary</a
		>
		dataset (data v{meta.packageVersion}). Models were extracted from the game data with
		<a
			href="https://github.com/Jonathan-Greve/GuildWarsMapBrowser"
			target="_blank"
			rel="noopener noreferrer">GuildWarsMapBrowser</a
		>, rendered headlessly in Blender, then validated and linked to the official wiki by hand.
	</p>

	<h2>Attribution</h2>
	<p class="legal">
		All extracted artwork is © ArenaNet / NCSoft, derived from Guild Wars game data. This is a
		non-commercial fan project in the spirit of the community's long-standing practice; assets
		will be removed immediately on request from the rights holder. The tooling and this site are
		the author's own.
	</p>
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
	.prose {
		max-width: 680px;
	}
	h1 {
		font-size: clamp(28px, 5vw, 40px);
		color: var(--gold-bright);
		margin: 0 0 18px;
	}
	h2 {
		color: var(--gold);
		font-size: 22px;
		margin: 32px 0 10px;
	}
	p {
		line-height: 1.7;
		color: #d8cbab;
		font-size: 18px;
	}
	.legal {
		font-size: 15px;
		color: #9a8c6c;
		font-style: italic;
		border-left: 2px solid var(--bronze);
		padding-left: 16px;
	}
	kbd {
		font-family: ui-monospace, monospace;
		font-size: 13px;
		background: rgba(201, 162, 39, 0.12);
		border: 1px solid var(--bronze);
		border-radius: 3px;
		padding: 1px 6px;
		color: var(--gold-bright);
	}
</style>
