import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import type { HeadConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { corpusDocs } from '../../scripts/workspace.mjs'

// srcDir points OUTSIDE this project root (the corpus checkout carries no
// node_modules), so the imports VitePress injects into each markdown page
// ('vue', 'vue/server-renderer') cannot be found by walking up from the
// page's own directory. Alias them (exact matches only) to this app's own
// dependency tree, resolved relative to this config file.
const require = createRequire(import.meta.url)
const vueDir = path.dirname(require.resolve('vue/package.json'))
const configDir = path.dirname(fileURLToPath(import.meta.url))

// Mermaid (via vitepress-plugin-mermaid) imports dayjs and @braintree/sanitize-url as bare specifiers.
// Neither ships a package.json "exports" map or an ESM build under "main", so Vite's dependency optimiser normally supplies the ESM interop.
// That optimiser forces both into optimizeDeps.include with no importer, so it resolves them from srcDir instead of this app.
// srcDir carries no node_modules, so resolution fails and the entries are dropped from optimisation.
// Each is then served raw once mermaid imports it, and the browser finds no ESM export to satisfy the bare import.
// dayjs ships an ESM build under esm/;
// sanitize-url ships none, so its TypeScript source stands in, which Vite already transforms on request.
// Aliasing each bare specifier to its real source, resolved from this app's own dependency tree, sidesteps the optimiser for both.
const dayjsEsm = require.resolve('dayjs/esm/index.js')
const sanitizeUrlSource = require.resolve('@braintree/sanitize-url/src/index.ts')

const siteHostname = 'https://note.theloommethod.org'
// The site description: the home page's own description and the fallback for
// any page without one, written once here rather than authored again per page.
const siteDescription =
  'Note is a method for capturing intent and specifications in structured markdown. Anyone with file access (human or AI) can participate, read, and write.'
// What the social card shows, for a reader who is served its alt text instead
// of the picture.
const siteImageAlt =
  'Note: intent, held in pattern. Beside the words, Ada Lovelace and her Note G, the first published computer program.'

// Mirrors VitePress's own sitemap URL derivation (the home page collapses to
// the site root, every other page keeps its .html extension), so canonical
// links and Open Graph URLs agree with the URLs sitemap.xml lists.
function pageUrl(relativePath: string): string {
  const clean = relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
  return `${siteHostname}/${clean}`
}

// The docs SOURCE lives in the Note corpus (corpora/note/docs in the west
// workspace); this repository is only the disposable renderer. srcDir points
// at the corpus in place, so the markdown is never moved or copied here.
//
// Two recorded accommodations (bake-off report):
// 1. markdown-it-attrs disabled, so brace text in prose stays literal.
// 2. Mermaid via vitepress-plugin-mermaid (withMermaid wraps the config).
// Dead links fail the build on purpose: the docs are self-contained and
// never link outside their own tree.
// docs/examples/ and docs/assets/ are excluded from the site: example files
// are data exercised by automated tests, and anything filed under assets
// addresses whoever maintains the corpus. Neither is a page for a reader.
export default withMermaid({
  title: 'Note',
  description: siteDescription,
  srcDir: corpusDocs(configDir),
  sitemap: { hostname: siteHostname },
  // Static assets ship from this app, not the corpus: Vite's public dir
  // would default to srcDir/public (inside the protected corpus checkout),
  // so it is pinned to this app's own docs/.vitepress/public instead.
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  ],
  // Remove generator tag.
  transformHtml(code) {
    return code.replace(/\s*<meta name="generator"[^>]*>\n?/, '')
  },
  transformPageData(pageData) {
    const isHome = pageData.relativePath === 'index.md'
    const title = pageData.title ? `Note: ${pageData.title}` : 'Note'
    const description = pageData.description || siteDescription
    const url = pageUrl(pageData.relativePath)
    const image = `${siteHostname}/note-social-card.png`
    const head: HeadConfig[] = [
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:site_name', content: 'Note' }],
      ['meta', { property: 'og:locale', content: 'en_GB' }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:type', content: 'image/png' }],
      ['meta', { property: 'og:image:width', content: '2400' }],
      ['meta', { property: 'og:image:height', content: '1260' }],
      ['meta', { property: 'og:image:alt', content: siteImageAlt }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }],
      ['meta', { name: 'twitter:image:alt', content: siteImageAlt }],
      ['link', { rel: 'canonical', href: url }],
    ]
    return {
      frontmatter: {
        ...pageData.frontmatter,
        head: [...(pageData.frontmatter.head ?? []), ...head],
      },
    }
  },
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
  srcExclude: ['examples/**', 'assets/**'],
  vite: {
    publicDir: path.join(configDir, 'public'),
    resolve: {
      alias: [
        { find: /^vue$/, replacement: path.join(vueDir, 'dist/vue.runtime.esm-bundler.js') },
        { find: /^vue\/server-renderer$/, replacement: path.join(vueDir, 'server-renderer/index.mjs') },
        { find: /^dayjs$/, replacement: dayjsEsm },
        { find: /^@braintree\/sanitize-url$/, replacement: sanitizeUrlSource },
      ],
    },
  },
  locales: {
    root: { label: 'English (GB)', lang: 'en-GB' },
  },
  themeConfig: {
    logo: { light: '/note-loom-wordmark.svg', dark: '/note-loom-wordmark-inverted.svg' },
    siteTitle: 'Note',
    search: { provider: 'local' },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Reference', link: '/reference/the-note-file' },
      { text: 'Manifesto', link: 'https://theloommanifesto.org/' },
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
    footer: {
      message: 'Released under the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0 License</a>.',
      copyright: 'Copyright © 2026 Bruno Almeida do Lago',
    },
  },
})
