// Theme extension: the default theme, extended, never replaced. Loom
// branding rides on top through custom.css, and the landing hero's image
// slot carries the Note G artwork (the corpus's `layout: home` frontmatter
// cannot express a linked image, so it is filled here instead).
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HeroImage from './HeroImage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroImage),
    }),
}
