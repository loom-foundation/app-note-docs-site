// Theme extension: the default theme, extended, never replaced.
//
// The landing page is the corpus's docs/index.md, which this repository must
// not touch. It renders with the default doc layout (no home-hero frontmatter),
// so the loom logo is injected here at the theme level through the layout's
// `doc-before` slot; the component itself renders only on the landing page.
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HomeLogo from './HomeLogo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(HomeLogo),
    }),
}
