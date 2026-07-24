<script>
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import meta from '$lib/generated/meta.json';

	let { children } = $props();

	// Header search drives the compendium via the URL (?q=). When already on the
	// compendium we update in place (replace, keep focus); from elsewhere we
	// navigate home. Local input mirrors the URL so it stays in sync on back/fwd.
	let term = $state('');
	let inputEl;
	let debounce;

	$effect(() => {
		// keep the box in sync with the URL's q when not actively typing here
		if (document.activeElement !== inputEl) {
			term = page.url.searchParams.get('q') || '';
		}
	});

	function run(value, { immediate = false } = {}) {
		term = value;
		clearTimeout(debounce);
		const onCompendium = page.url.pathname === '/';
		const nav = () => {
			// Keep any active facet filters — only q (and the page cursor) change.
			const p = new URLSearchParams(onCompendium ? page.url.searchParams : undefined);
			if (value) p.set('q', value);
			else p.delete('q');
			p.delete('page');
			const qs = p.toString();
			goto(qs ? `/?${qs}` : '/', { replaceState: onCompendium, keepFocus: true, noScroll: true });
		};
		if (immediate) nav();
		else debounce = setTimeout(nav, 160);
	}

	function onSubmit(e) {
		e.preventDefault();
		run(term, { immediate: true });
	}

	// "/" focuses the search box from anywhere; Esc clears it (or blurs when
	// already empty). Documented on the About page.
	function onKeydown(e) {
		if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
			const t = e.target;
			if (t instanceof HTMLElement && (t.matches('input, textarea, select') || t.isContentEditable))
				return;
			e.preventDefault();
			inputEl.focus();
			inputEl.select();
		} else if (e.key === 'Escape' && document.activeElement === inputEl) {
			if (term) run('', { immediate: true });
			else inputEl.blur();
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onkeydown={onKeydown} />

<a class="skip" href="#main">Skip to content</a>

<header>
	<a class="brand" href="/">
		<span class="sigil" aria-hidden="true">❧</span>
		<span class="brand-text">
			<span class="kicker">Guild Wars</span>
			<span class="title">Bestiary</span>
		</span>
	</a>
	<form class="hsearch" role="search" onsubmit={onSubmit}>
		<span class="hsearch-ico" aria-hidden="true">⚲</span>
		<input
			bind:this={inputEl}
			type="search"
			placeholder="Search the bestiary…"
			aria-label="Search creatures and NPCs"
			value={term}
			oninput={(e) => run(e.currentTarget.value)}
			autocomplete="off"
			spellcheck="false"
		/>
	</form>

	<nav>
		<a href="/" class:on={page.url.pathname === '/'}>Compendium</a>
		<a href="/skill" class:on={page.url.pathname.startsWith('/skill')}>Skills</a>
		<a href="/about" class:on={page.url.pathname === '/about'}>About</a>
	</nav>
</header>

<main id="main">{@render children()}</main>

<footer>
	<span>
		{meta.count} creatures &amp; NPCs · rendered from the original Guild Wars game models
	</span>
	<span>
		crafted by <a class="author" href="https://cedricdessalles.dev" rel="author">Cédric Dessalles</a>
	</span>
	<span class="legal">
		Artwork © ArenaNet / NCSoft · non-commercial fan project
	</span>
</footer>

<style>
	:global(:root) {
		/* GW1 "Dark Age" palette: deep stone backdrop, aged parchment panels,
		   gold/bronze trim, serif display type. */
		--bg: #14110c;
		--bg-2: #1d1813;
		--panel: #efe4c9;
		--panel-edge: #d8c8a2;
		--parchment-shadow: #cdbd97;
		--ink: #2c2418;
		--ink-soft: #5a4d36;
		--gold: #c9a227;
		--gold-bright: #e6c453;
		--bronze: #8a6d3a;
		--rule: #3a2f20;
		--accent: #b5462e; /* sealing-wax red, used sparingly */
		--shadow: rgba(0, 0, 0, 0.55);
	}

	:global(html, body) {
		height: 100%;
	}
	:global(body) {
		margin: 0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		color: #e8dcc0;
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 18px;
		background-color: var(--bg);
		background-image:
			radial-gradient(ellipse at top, rgba(90, 70, 35, 0.18), transparent 60%),
			repeating-linear-gradient(
				0deg,
				rgba(0, 0, 0, 0.12) 0px,
				rgba(0, 0, 0, 0.12) 1px,
				transparent 1px,
				transparent 3px
			);
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(h1, h2, h3) {
		font-family: 'Cinzel', 'Times New Roman', serif;
		letter-spacing: 0.02em;
		font-weight: 600;
	}
	:global(a) {
		color: var(--gold-bright);
		text-decoration: none;
	}

	.skip {
		position: absolute;
		left: -9999px;
		top: 0;
		background: var(--gold);
		color: var(--ink);
		padding: 8px 14px;
		z-index: 100;
	}
	.skip:focus {
		left: 8px;
		top: 8px;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px 16px;
		padding: 14px clamp(16px, 4vw, 48px);
		border-bottom: 2px solid var(--gold);
		background: linear-gradient(180deg, #221b12, #18130d);
		box-shadow: 0 2px 0 var(--bronze), 0 6px 18px var(--shadow);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.hsearch {
		position: relative;
		flex: 1 1 auto;
		max-width: 440px;
		margin: 0 8px;
	}
	.hsearch-ico {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%) rotate(-45deg);
		color: var(--bronze);
		font-size: 17px;
		pointer-events: none;
	}
	.hsearch input {
		width: 100%;
		padding: 8px 14px 8px 34px;
		font-family: 'EB Garamond', serif;
		font-size: 16px;
		color: var(--ink);
		background: linear-gradient(180deg, #f4ebd4, var(--panel));
		border: 1px solid var(--bronze);
		border-radius: 3px;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
		outline: none;
	}
	.hsearch input::placeholder {
		color: #8a7c5e;
		font-style: italic;
	}
	.hsearch input:focus {
		border-color: var(--gold);
		box-shadow: 0 0 0 2px var(--gold);
	}
	@media (max-width: 640px) {
		.hsearch {
			order: 3;
			flex-basis: 100%;
			max-width: none;
			margin: 4px 0 0;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		color: inherit;
	}
	.sigil {
		font-size: 30px;
		color: var(--gold);
		text-shadow: 0 0 10px rgba(201, 162, 39, 0.5);
	}
	.brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1;
	}
	.kicker {
		font-family: 'Cinzel', serif;
		font-size: 11px;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		color: var(--bronze);
	}
	.title {
		font-family: 'Cinzel', serif;
		font-size: 24px;
		font-weight: 700;
		color: var(--gold-bright);
		letter-spacing: 0.06em;
	}
	nav {
		display: flex;
		gap: 6px;
	}
	nav a {
		font-family: 'Cinzel', serif;
		font-size: 13px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #cdbf9d;
		padding: 8px 16px;
		border: 1px solid transparent;
		border-radius: 2px;
	}
	nav a:hover {
		color: var(--gold-bright);
		border-color: var(--bronze);
	}
	nav a.on {
		color: var(--ink);
		background: linear-gradient(180deg, var(--gold-bright), var(--gold));
		border-color: var(--gold-bright);
	}

	main {
		flex: 1;
		width: 100%;
		max-width: 1280px;
		margin: 0 auto;
		padding: clamp(20px, 4vw, 44px) clamp(16px, 4vw, 48px) 64px;
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
		text-align: center;
		padding: 22px 16px 30px;
		border-top: 1px solid var(--rule);
		color: #8a7c5e;
		font-size: 14px;
	}
	footer .author {
		color: #b7a883;
	}
	footer .author:hover {
		color: var(--gold-bright);
	}
	footer .legal {
		font-size: 12px;
		color: #6b5e44;
	}
</style>
