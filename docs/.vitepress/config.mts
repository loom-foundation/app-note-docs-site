import path from 'node:path'
import { createRequire } from 'node:module'
import { withMermaid } from 'vitepress-plugin-mermaid'

// srcDir points OUTSIDE this project root (the corpus checkout carries no
// node_modules), so the imports VitePress injects into each markdown page
// ('vue', 'vue/server-renderer') cannot be found by walking up from the
// page's own directory. Alias them (exact matches only) to this app's own
// dependency tree, resolved relative to this config file.
const require = createRequire(import.meta.url)
const vueDir = path.dirname(require.resolve('vue/package.json'))

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
  markdown: { attrs: { disable: true } },
  srcExclude: ['examples/**'],
  vite: {
    resolve: {
      alias: [
        { find: /^vue$/, replacement: path.join(vueDir, 'dist/vue.runtime.esm-bundler.js') },
        { find: /^vue\/server-renderer$/, replacement: path.join(vueDir, 'server-renderer/index.mjs') },
      ],
    },
  },
  themeConfig: {
    search: { provider: 'local' },
    sidebar: [
      {
        text: 'Tutorials',
        items: [
          { text: 'Your first note', link: '/tutorials/your-first-note' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'The note file', link: '/reference/the-note-file' },
          { text: 'Identifiers', link: '/reference/identifiers' },
        ],
      },
      {
        text: 'Explanation',
        items: [
          { text: 'Why opaque ids', link: '/explanation/why-opaque-ids' },
        ],
      },
    ],
  },
})
