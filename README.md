# app-note-docs-site

The disposable VitePress renderer that builds the Note docs into a static site.

The docs SOURCE stays in the Note corpus ([`loom-foundation/corpus-note`](https://github.com/loom-foundation/corpus-note), at `corpora/note/docs` in the west workspace); this repository holds only the rendering harness (`package.json` and `docs/.vitepress/config.mts`) and reads the markdown in place, so the two can never drift.

## Building

The renderer reads the corpus from one sibling checkout and the brand assets from another, so assemble the workspace first:

```sh
cd path/to/loom-foundation && west update
cd apps/note-docs-site && npm install && npm run docs:build
```

The static site lands in `docs/.vitepress/dist/`.

The favicon and the two wordmarks are owned by [`loom-foundation/org`](https://github.com/loom-foundation/org) and are build output here, not source.
`scripts/copy-brand-assets.mjs` runs before `docs:dev` and `docs:build`, copying them from `org/brand/assets/` into `docs/.vitepress/public/`, which `.gitignore` keeps untracked.
The build fails and names the missing files when the `org` checkout is absent.

## Continuous integration

This repository has no workflow yet.
Whoever writes one must reproduce the west workspace layout with three checkouts, as [`app-manifesto-site`](https://github.com/loom-foundation/app-manifesto-site/blob/main/.github/workflows/release.yml) already does: this repository at `apps/note-docs-site`, [`corpus-note`](https://github.com/loom-foundation/corpus-note) at `corpora/note` for the docs source, and [`org`](https://github.com/loom-foundation/org) at `org` for the brand assets.
