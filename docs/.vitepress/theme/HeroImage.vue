<!-- The landing hero's artwork: Ada Lovelace's Note G, linked to its story.
     The corpus's index.md frontmatter cannot express a linked image, so the
     default theme's home-hero-image slot carries it instead. The img keeps
     the theme's own `image-src` class, so the theme's own sizing and
     placement apply unchanged. Only the fade lives here. -->
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
/* A radial mask dissolves the bitmap's square edge into the page. The stops
   are measured against the nearest side, so the fade completes well inside
   every straight edge and no side or corner ever meets the page. */
.note-g {
  -webkit-mask-image: radial-gradient(
    closest-side circle at 50% 50%,
    #000 54%,
    rgba(0, 0, 0, 0.5) 74%,
    rgba(0, 0, 0, 0.12) 88%,
    transparent 99%
  );
  mask-image: radial-gradient(
    closest-side circle at 50% 50%,
    #000 54%,
    rgba(0, 0, 0, 0.5) 74%,
    rgba(0, 0, 0, 0.12) 88%,
    transparent 99%
  );
}

/* The artwork sits on cream paper, which reads as a lit disc against a dark
   page. The dark theme dims it toward the background so the masked edge
   dissolves rather than glows. */
html.dark .note-g {
  filter: brightness(0.82) contrast(1.04);
}
</style>
