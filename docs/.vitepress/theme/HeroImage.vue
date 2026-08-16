<!-- The landing hero's artwork: Ada Lovelace's Note G, linked to its story.
     The corpus's index.md frontmatter cannot express a linked image, so the
     default theme's home-hero-image slot carries it instead. The img keeps
     the theme's own `image-src` class, so sizing stays the default theme's.

     Two deliberate departures from that default, both owner-directed:
     a radial mask dissolves the artwork's square edge into the page, and at
     the desktop breakpoint the image drops so its top meets the top of the
     "Note" heading beside it. Below that breakpoint the hero stacks, the
     heading no longer sits beside the image, and the offset is dropped. -->
<template>
  <a
    href="https://en.wikipedia.org/wiki/Note_G"
    target="_blank"
    rel="noopener"
  >
    <img
      class="image-src note-g"
      src="/ada-lovelace-note-g.webp"
      width="640"
      height="640"
      alt="Ada Lovelace's Note G, the first published computer program"
    />
  </a>
</template>

<style scoped>
/* The mask is opaque across the middle and falls away to nothing before the
   bitmap's own edge, so no straight side or corner ever meets the page. */
.note-g {
  -webkit-mask-image: radial-gradient(
    closest-side circle at 50% 48%,
    #000 52%,
    rgba(0, 0, 0, 0.65) 70%,
    rgba(0, 0, 0, 0.25) 84%,
    transparent 96%
  );
  mask-image: radial-gradient(
    closest-side circle at 50% 48%,
    #000 52%,
    rgba(0, 0, 0, 0.65) 70%,
    rgba(0, 0, 0, 0.25) 84%,
    transparent 96%
  );
}

/* The theme centres the image with translate(-50%, -50%); the offset is added
   to that translation rather than replacing it. 960px is the breakpoint at
   which the theme puts the heading beside the image instead of above it. */
@media (min-width: 960px) {
  .note-g {
    transform: translate(-50%, calc(-50% + 64px));
  }
}
</style>
