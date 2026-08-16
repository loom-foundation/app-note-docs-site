# app-note-docs-site

The disposable VitePress renderer that builds the Note docs into a static site.

The docs SOURCE stays in the Note corpus ([`loom-foundation/note`](https://github.com/loom-foundation/note), at `corpus/note/docs` in the west workspace); this repository holds only the rendering harness (`package.json` and `docs/.vitepress/config.mts`) and reads the markdown in place, so the two can never drift.

## Building

The renderer reads the corpus from the sibling checkout in the west workspace, so assemble the workspace first:

```sh
cd path/to/loom-foundation && west update
cd apps/app-note-docs-site && npm install && npm run docs:build
```

The static site lands in `docs/.vitepress/dist/`.
