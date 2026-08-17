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

## The social card

The image a link to any page unfurls with is a still of the landing hero at `docs/.vitepress/public/note-social-card.png`.
It is laid out to the 1200x630 Open Graph and Twitter ask for and drawn at twice it, so the file is 2400x1260 and stays sharp on the displays that show it.

It is designed as an ordinary web page, `scripts/social-card/card.html`, which opens straight in a browser and draws its type and colour from the site's own stylesheets.
Beside it sits the 1024x1024 artwork master the card is drawn from, which the landing hero's smaller WebP is also cut from.
Neither is under `public/`, since everything there is published and the master has no reason to be served.

The words are not written on the page.
They are read at render time from the hero block of the corpus home page, `corpora/note/docs/index.md`, so a reworded hero reaches the card on the next render.
The copy in the markup is what the page shows when opened on its own; each block names the frontmatter field it stands for, and a block naming a field the hero does not declare stops the render.

The card is build output, not source: `scripts/render-social-card.mjs` runs before `docs:build`, so an ordinary build redraws it from whatever its inputs now say, and `.gitignore` keeps the result untracked.
Editing the page and building is the whole update cycle; `npm run social-card` renders it alone.

It is photographed by whatever Chromium is on the machine: Playwright's own where it has been fetched, and the system's Chrome otherwise, which is what CI uses.
Neither is needed to run `docs:dev`, which does not draw the card.

```sh
npx playwright install chromium   # optional, pins the browser to Playwright's
npm run social-card
```

## Continuous integration

`.github/workflows/ci.yml` builds the site on every push and pull request, and deploys `main` to Cloudflare.

It assembles the west workspace rather than imitating it: the manifest repository is checked out, `west init -l` registers it, and `west update` places each named project where `west.yml` says it goes.
The workflow names two projects and nothing else, so a script that reaches a sibling repository reaches it the same way in both places, and the layout stays declared in one file.
