# gw1-bestiary-website

A searchable, GW1-themed bestiary site for the
[`@geptyro/gw1-bestiary`](https://github.com/Geptyro/gw1-bestiary) dataset.
SvelteKit + `adapter-static` (fully prerendered). Dev server on port 5310.

## Data source

The site consumes the published **`@geptyro/gw1-bestiary`** npm package
(`package.json` pins a normal version range — this is what production / a fresh
`npm install` uses). At dev/build time `scripts/prepare-data.js` reads the
installed package, copies sprites into `static/npc/`, and emits the search index
+ facet index into `src/lib/generated/`.

## Local debugging against an unpublished package

The package's data is enriched by a private pipeline (facets from the wiki
infobox, per-NPC skills). While that enrichment is **not yet published to npm**,
develop against your local working copy with `npm link` — this overrides
`node_modules` **without changing `package.json`**, so the proper published
dependency stays intact:

```sh
# one-time: register the local package globally (run in the package repo)
cd ../gw1-bestiary && npm link

# in this repo: point node_modules at the linked copy
npm run link-local        # = npm link @geptyro/gw1-bestiary
```

> **Note:** a plain `npm install` here replaces the symlink with the registry
> version (un-enriched). After any `npm install`, re-run `npm run link-local`.
> If `npm link` fails with an EACCES on `/usr`, set a user-writable global
> prefix first: `npm config set prefix ~/.npm-global`.

When a new enriched package version is published, drop the link
(`npm install`) and the pinned version range just works.

## Develop

```sh
npm install
npm run link-local   # only while the enriched package is unpublished
npm run dev          # http://localhost:5310
```
