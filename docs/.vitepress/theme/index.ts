// Theme extension: the default theme, extended, never replaced. All loom
// branding rides on top through custom.css; the landing page is a real
// `layout: home` page in the corpus, so nothing is injected here.
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
}
