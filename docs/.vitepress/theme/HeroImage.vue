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
    rgba(0, 0, 0, 0.15) 92%,
    transparent 99%
  );
  mask-image: radial-gradient(
    closest-side circle at 50% 50%,
    #000 82%,
    rgba(0, 0, 0, 0.15) 92%,
    transparent 99%
  );
}

/* The artwork sits on cream paper, so on a dark page the same fade leaves a
   bright disc with a visible halo where the paper meets the background. The
   dark theme therefore starts the fade further in and runs it longer, and
   dims the paper toward the page, so the edge dissolves rather than glows. */
html.dark .note-g {
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
  filter: brightness(0.82) contrast(1.04);
}

/* Above this width the hero is side by side and the container is capped, so
   every edge here is fixed; below it the hero stacks and the theme's own
   centring stands. custom.css carries the matching collapse.

   The artwork is placed from the left edge of its column, which is the text
   column's right edge, so the distance between text and artwork is the same
   at every width. Placing it from the column's centre or its right edge ties
   it to the column's width, and the column is fluid below the cap, which is
   what walked the artwork sideways on a resize. */
@media (min-width: 1280px) {
  .note-g {
    top: 50%;
    left: 240px;
    right: auto;
    transform: translateY(calc(-50% + 51px));
  }
}
</style>
