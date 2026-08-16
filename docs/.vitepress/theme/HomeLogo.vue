<script setup lang="ts">
// The loom combination mark, shown above the landing page's content only.
// Inlined (copied from org/brand/assets/loom-logo.svg, minus the @font-face
// that pointed outside the asset) so page CSS can invert it for dark mode and
// animate the infinity stroke; no external requests at runtime.
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const isHome = computed(() => page.value.relativePath === 'index.md')
</script>

<template>
  <div v-if="isHome" class="loom-home-logo" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="92 32 416 507">
      <defs>
        <linearGradient id="loom-gradLeft" x1="0" y1="80" x2="0" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00E5FF"/>
          <stop offset="50%" stop-color="#8A2BE2"/>
          <stop offset="100%" stop-color="#D600FF"/>
        </linearGradient>
        <linearGradient id="loom-gradRight" x1="0" y1="80" x2="0" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#D600FF"/>
          <stop offset="50%" stop-color="#8A2BE2"/>
          <stop offset="100%" stop-color="#00E5FF"/>
        </linearGradient>
        <linearGradient id="loom-gradInfinity" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00E5FF"/>
          <stop offset="50%" stop-color="#8A2BE2"/>
          <stop offset="100%" stop-color="#D600FF"/>
        </linearGradient>
        <clipPath id="loom-circle-mask">
          <circle cx="300" cy="240" r="160" />
        </clipPath>
      </defs>

      <g clip-path="url(#loom-circle-mask)" shape-rendering="crispEdges">
        <rect x="0" y="0" width="218" height="158" class="loom-logo-bg" />
        <rect x="382" y="0" width="218" height="158" class="loom-logo-bg" />
        <rect x="0" y="322" width="218" height="238" class="loom-logo-bg" />
        <rect x="382" y="322" width="218" height="238" class="loom-logo-bg" />

        <rect x="0" y="186" width="600" height="40" class="loom-logo-bg" />
        <rect x="0" y="254" width="600" height="40" class="loom-logo-bg" />

        <rect x="246" y="0" width="40" height="560" fill="url(#loom-gradLeft)" />
        <rect x="314" y="0" width="40" height="560" fill="url(#loom-gradRight)" />

        <rect x="314" y="186" width="40" height="40" class="loom-logo-bg" />
        <rect x="246" y="254" width="40" height="40" class="loom-logo-bg" />
      </g>

      <text x="230" y="480" class="loom-logo-text" text-anchor="end">L</text>

      <path id="loom-infinity-path"
            d="M 300 455
               C 312 425, 355 425, 355 455
               C 355 485, 312 485, 300 455
               C 288 425, 245 425, 245 455
               C 245 485, 288 485, 300 455 Z"
            fill="none"
            stroke="url(#loom-gradInfinity)"
            stroke-width="12"
            stroke-linecap="round"
            stroke-linejoin="round" />

      <text x="370" y="480" class="loom-logo-text" text-anchor="start">M</text>
    </svg>
  </div>
</template>

<style scoped>
.loom-home-logo {
  display: flex;
  justify-content: center;
  margin: 8px 0 24px;
}

.loom-home-logo svg {
  width: 180px;
  height: auto;
}

/* Deep Space Navy on light grounds; Loom Paper on dark, matching the
   inverted brand variant. */
.loom-home-logo :deep(.loom-logo-bg) {
  fill: #0A1B3D;
}

.loom-home-logo :deep(.loom-logo-text) {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 69px;
  fill: #0A1B3D;
}

.dark .loom-home-logo :deep(.loom-logo-bg),
.dark .loom-home-logo :deep(.loom-logo-text) {
  fill: #F6F4EE;
}

/* The manifesto site's draw-in of the infinity stroke, ported as-is:
   pure CSS over the inlined path, no dependencies. */
.loom-home-logo :deep(#loom-infinity-path) {
  stroke-dasharray: 340;
  stroke-dashoffset: 340;
  animation: loom-draw-infinity 0.72s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
}

@keyframes loom-draw-infinity {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loom-home-logo :deep(#loom-infinity-path) {
    animation: none;
    stroke-dasharray: none;
    stroke-dashoffset: 0;
  }
}
</style>
