import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { withMermaid } from 'vitepress-plugin-mermaid'

// srcDir points OUTSIDE this project root (the corpus checkout carries no
// node_modules), so the imports VitePress injects into each markdown page
// ('vue', 'vue/server-renderer') cannot be found by walking up from the
// page's own directory. Alias them (exact matches only) to this app's own
// dependency tree, resolved relative to this config file.
const require = createRequire(import.meta.url)
const vueDir = path.dirname(require.resolve('vue/package.json'))
const configDir = path.dirname(fileURLToPath(import.meta.url))

// The docs SOURCE lives in the Note corpus (corpora/note/docs in the west
// workspace, three levels up from this project root); this repository is
// only the disposable renderer. srcDir points at the corpus in place, so
// the markdown is never moved or copied here.
//
// Two recorded accommodations (bake-off report):
// 1. markdown-it-attrs disabled, so brace text in prose stays literal.
// 2. Mermaid via vitepress-plugin-mermaid (withMermaid wraps the config).
// Dead links fail the build on purpose: the docs are self-contained and
// never link outside their own tree.
// docs/examples/ is excluded from the site: example files are data
// exercised by automated tests, not pages.
export default withMermaid({
  title: 'Note',
  srcDir: '../../../corpora/note/docs',
  // Static assets ship from this app, not the corpus: Vite's public dir
  // would default to srcDir/public (inside the protected corpus checkout),
  // so it is pinned to this app's own docs/.vitepress/public instead.
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  markdown: {
    attrs: { disable: true },
    // VitePress 1.x hard-codes UPPERCASE labels for GitHub-flavoured alerts;
    // GitHub itself renders them in Title case ("Important"). Re-case the
    // default labels at render time; author-supplied custom titles pass
    // through untouched.
    config(md) {
      const orig = md.renderer.rules.github_alert_open
      if (orig) {
        md.renderer.rules.github_alert_open = (tokens, idx, ...rest) => {
          const meta = tokens[idx].meta as { title?: string } | undefined
          if (meta?.title && /^[A-Z]+$/.test(meta.title)) {
            meta.title = meta.title.charAt(0) + meta.title.slice(1).toLowerCase()
          }
          return orig(tokens, idx, ...rest)
        }
      }
    },
  },
  srcExclude: ['examples/**'],
  vite: {
    publicDir: path.join(configDir, 'public'),
    resolve: {
      alias: [
        { find: /^vue$/, replacement: path.join(vueDir, 'dist/vue.runtime.esm-bundler.js') },
        { find: /^vue\/server-renderer$/, replacement: path.join(vueDir, 'server-renderer/index.mjs') },
      ],
    },
  },
  // Root locale scaffolding: English (GB) today. VitePress only renders the
  // language menu once a second locale is configured; this keys the structure
  // so that day is an additive change.
  locales: {
    root: { label: 'English (GB)', lang: 'en-GB' },
  },
  themeConfig: {
    logo: { light: '/loom-wordmark.svg', dark: '/loom-wordmark-inverted.svg' },
    siteTitle: 'Note',
    search: { provider: 'local' },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/the-note-file' },
      {
        text: '0.9.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/loom-foundation/corpus-note/commits/main' },
          { text: 'Contributing', link: 'https://github.com/loom-foundation/corpus-note/blob/main/CONTRIBUTING.md' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Your first note', link: '/guide/your-first-note' },
            { text: 'Why opaque ids', link: '/guide/why-opaque-ids' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'The note file', link: '/reference/the-note-file' },
            { text: 'Identifiers', link: '/reference/identifiers' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/loom-foundation/corpus-note' },
    ],
  },
})
