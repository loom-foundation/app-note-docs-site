// Copies the Foundation brand assets into the VitePress public directory.
//
// The favicon, the Apple touch icon and the two wordmarks are owned by
// loom-foundation/org, which is their single source of truth. They are not
// tracked here: the npm `predocs:build` and `predocs:dev` hooks run this
// script, so an ordinary
// `npm run docs:build` or `npm run docs:dev` picks them up, and .gitignore
// keeps the copies out of the repository.
//
// scripts/render-social-card.mjs writes the social card into the same
// directory on the same hook, and is likewise ignored. The WebP the landing
// hero loads is the one tracked file there. The 1024x1024 PNG master both it
// and the card are cut from is kept out of that directory on purpose:
// everything under it is published, and 1.8 MB of artwork has no reason to be
// served.
//
// The source is the sibling `org` checkout in the west workspace, the same
// assumption `docs/.vitepress/config.mts` already makes of the corpus.
//
// The wordmarks arrive recoloured. A browser treats an SVG behind an img tag
// as its own document, so no stylesheet on the page reaches the gradient
// inside it, and the infinity would keep the house spectrum whatever the
// theme declares. Substituting the stops on the way in is the one place the
// project's colours can reach it. The letterforms are left alone: they are
// the brand's own ink, navy in one file and parchment in the other.
//
// A recoloured mark is not the Loom wordmark, so the copies are named for the
// project that carries them rather than for the brand they came from.
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brandAssets } from './workspace.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let sourceDir
try {
  sourceDir = brandAssets(repoRoot)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const targetDir = path.join(repoRoot, 'docs/.vitepress/public')
const themeCss = path.join(repoRoot, 'docs/.vitepress/theme/custom.css')

const copied = ['favicon.svg', 'apple-touch-icon.png']

const recoloured = [
  { from: 'loom-wordmark.svg', to: 'note-loom-wordmark.svg' },
  { from: 'loom-wordmark-inverted.svg', to: 'note-loom-wordmark-inverted.svg' },
]

// The house spectrum, in the order the mark's gradient declares it, paired with
// the token that replaces each stop. Read from the theme rather than repeated
// here, so recolouring the site stays a matter of editing custom.css.
const stops = [
  { house: '#00E5FF', token: '--loom-accent-1' },
  { house: '#8A2BE2', token: '--loom-accent-2' },
  { house: '#D600FF', token: '--loom-accent-3' },
]

const missing = []
for (const asset of [...copied, ...recoloured.map((a) => a.from)]) {
  try {
    await stat(path.join(sourceDir, asset))
  } catch {
    missing.push(asset)
  }
}

if (missing.length > 0) {
  console.error(
    [
      `Brand assets missing from ${sourceDir}:`,
      ...missing.map((asset) => `  ${asset}`),
      '',
      'These files are owned by loom-foundation/org and are copied in at build',
      'time rather than tracked in this repository. Assemble the west workspace',
      'so the checkout sits beside this app, then build again:',
      '',
      '  cd path/to/loom-foundation && west update',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

const theme = await readFile(themeCss, 'utf8')
const palette = stops.map(({ house, token }) => {
  const declared = theme.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`))
  if (!declared) {
    console.error(
      `No ${token} found in ${path.relative(repoRoot, themeCss)}.\n` +
        'The wordmark takes its gradient from the theme\'s palette, so each stop\n' +
        'needs a plain six-digit hex declared there.',
    )
    process.exit(1)
  }
  return { house, project: declared[1] }
})

await mkdir(targetDir, { recursive: true })

for (const asset of copied) {
  await copyFile(path.join(sourceDir, asset), path.join(targetDir, asset))
}

for (const { from, to } of recoloured) {
  let markup = await readFile(path.join(sourceDir, from), 'utf8')

  for (const { house, project } of palette) {
    const occurrences = markup.split(house).length - 1
    // Silence here would ship the house spectrum and read as a theme bug, so a
    // mark whose gradient no longer matches stops the build instead.
    if (occurrences !== 1) {
      console.error(
        `Expected one ${house} stop in ${from}, found ${occurrences}.\n` +
          'The mark\'s gradient has changed upstream. Reconcile the stops in\n' +
          `${path.relative(repoRoot, fileURLToPath(import.meta.url))} with the asset.`,
      )
      process.exit(1)
    }
    markup = markup.replace(house, project)
  }

  await writeFile(path.join(targetDir, to), markup)
}

console.log(
  `Copied ${copied.length + recoloured.length} brand assets from ${sourceDir}, ` +
    `${recoloured.length} recoloured from the theme's palette.`,
)
