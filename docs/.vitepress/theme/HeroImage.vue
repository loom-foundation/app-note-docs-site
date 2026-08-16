<!-- The landing hero's artwork: Ada Lovelace's Note G, linked to its story.
     The corpus's index.md frontmatter cannot express a linked image, so the
     default theme's home-hero-image slot carries it instead. The img keeps
     the theme's own `image-src` class, so sizing stays the default theme's. -->
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
   are measured against the nearest side, so the fade completes just inside
   every straight edge and no side or corner ever meets the page. Holding
   full opacity to 82% keeps the Bernoulli diagram intact and confines the
   fade to a narrow band. */
.note-g {
  -webkit-mask-image: radial-gradient(
    closest-side circle at 50% 50%,
    #000 82%,
    rgba(0, 0, 0, 0.45) 92%,
    transparent 99%
  );
  mask-image: radial-gradient(
    closest-side circle at 50% 50%,
    #000 82%,
    rgba(0, 0, 0, 0.45) 92%,
    transparent 99%
  );
}

/* Above this width the theme sets the hero side by side and the artwork is
   placed against the heading; below it the hero stacks and the theme's own
   centring stands. The translation is the theme's, restated because these
   offsets replace the declaration carrying it. */
@media (min-width: 960px) {
  .note-g {
    top: 45%;
    left: 55%;
    transform: translate(-50%, -50%);
  }
}
</style>
