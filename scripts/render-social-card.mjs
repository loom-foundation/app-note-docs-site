// Renders the Open Graph / Twitter social card to a PNG.
//
// The card is designed as an ordinary web page (scripts/social-card/card.html)
// and photographed here. Chromium loads the page straight off disk, so the
// render needs nothing running and no network: the artwork, the theme's
// stylesheet and Inter all resolve as relative paths from the page's own
// directory.
//
// The words on it are the landing hero's, read from the corpus page that
// declares them, so a reworded hero reaches the card on the next render and
// the two cannot say different things.
//
// The PNG is build output, not source: `predocs:build` runs this script, so an
// ordinary `npm run docs:build` redraws the card from whatever its inputs now
// say, and .gitignore keeps the result out of the repository. `npm run
// social-card` renders it alone.
//
// Any Chromium will do. Playwright's own, downloaded by a step separate from
// npm install, is used when it is there:
//
//   npx playwright install chromium
//
// Otherwise the browser already on the machine stands in, which is what CI
// uses: the runner image ships a stable Chrome, so the card costs the build no
// download, no cache and no dependency on a CDN that could be having a bad day
// while a deploy is waiting.
import path from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { corpusDocs } from './workspace.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cardPage = path.join(repoRoot, 'scripts/social-card/card.html')
const target = path.join(repoRoot, 'docs/.vitepress/public/note-social-card.png')

// The card's own dimensions, which the page lays itself out to. The viewport
// matches them so the page is photographed at its natural size, with nothing
// scrolled and nothing scaled.
const width = 1200
const height = 630

// Pixels per CSS pixel. 1200x630 is the shape both networks ask for, not a
// resolution: a card is shown on displays that pack two device pixels into
// each of those, and one rendered at 1:1 arrives soft on every one of them.
// Photographing at 2 lands a 2400x1260 file, which they scale down.
const scale = 2

function fail(...lines) {
  console.error(lines.join('\n'))
  process.exit(1)
}

let homePage
try {
  homePage = path.join(corpusDocs(repoRoot), 'index.md')
} catch (error) {
  fail(error.message)
}

// A YAML scalar as the home page writes one: bare, or quoted when the value
// would otherwise read as syntax. Only the one-line forms are handled, because
// only those appear there; a folded or block scalar would arrive with its
// markers intact and is refused below rather than rendered.
function scalar(value) {
  if (/^'[^']*'$/.test(value)) return value.slice(1, -1).replace(/''/g, "'")
  if (/^"[^"]*"$/.test(value)) return value.slice(1, -1).replace(/\\(.)/g, '$1')
  return value
}

// The three fields of the home page's hero, read out of its frontmatter.
//
// The frontmatter is picked apart by hand rather than by a YAML parser: this
// repository carries none, and the site build has no other use for one. The
// reading is deliberately narrow, and anything it does not recognise stops the
// render instead of being guessed at.
function heroCopy(markdown) {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!frontmatter) {
    fail(`No frontmatter block at the top of ${homePage}.`)
  }

  const lines = frontmatter[1].split(/\r?\n/)
  const hero = lines.findIndex((line) => /^hero:\s*$/.test(line))
  if (hero === -1) {
    fail(`No hero block in the frontmatter of ${homePage}.`)
  }

  // The hero's own fields, which are the lines indented one level under it.
  // Its actions are nested deeper and are passed over; a line back at column
  // zero is the next top-level key and ends the block.
  const copy = {}
  for (const line of lines.slice(hero + 1)) {
    if (/^\S/.test(line)) break
    const field = line.match(/^ {2}(name|text|tagline):[ \t]*(\S.*?)\s*$/)
    if (field) copy[field[1]] = scalar(field[2])
  }

  const missing = ['name', 'text', 'tagline'].filter((field) => !copy[field])
  if (missing.length > 0) {
    fail(
      `The hero in ${homePage} declares no ${missing.join(', ')}.`,
      'The card is a still of that hero and carries all three, so it cannot be',
      'rendered without them.',
    )
  }

  return copy
}

if (!existsSync(homePage)) {
  fail(
    `No home page at ${homePage}.`,
    'The card takes its words from the corpus. Assemble the west workspace so',
    'the checkout sits beside this app, then render again:',
    '',
    '  cd path/to/loom-foundation && west update',
    '',
  )
}

const copy = heroCopy(await readFile(homePage, 'utf8'))

// Playwright's own Chromium first, since it is pinned to the library's version
// and renders the same on every machine that has it. Failing that, the stable
// Chrome already installed, which is how this runs on a machine that never
// downloaded one and how it runs in CI.
let browser
try {
  browser = await chromium.launch()
} catch {
  try {
    browser = await chromium.launch({ channel: 'chrome' })
  } catch (error) {
    fail(
      error.message,
      '',
      'The card is photographed by a browser, and neither Chromium nor Chrome',
      "could be started. Playwright's own arrives in a step separate from npm",
      'install:',
      '',
      '  npx playwright install chromium',
      '',
    )
  }
}

const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: scale,
})

// A missing stylesheet, font or image would otherwise be painted as an absence
// and shipped: the card would simply render in the wrong typeface, or without
// its artwork, and nothing would say so.
const failed = []
page.on('requestfailed', (request) => failed.push(request.url()))
page.on('response', (response) => {
  if (!response.ok()) failed.push(`${response.url()} (${response.status()})`)
})

await page.goto(pathToFileURL(cardPage).href, { waitUntil: 'load' })

// Each block of copy on the card names the hero field it stands for, and the
// corpus has just supplied all three. A block naming a field that does not
// exist, or a field with no block to fill, means the card and the hero have
// drifted apart, which is the one thing reading from the corpus is for.
const unfilled = await page.evaluate((copy) => {
  const blocks = [...document.querySelectorAll('[data-hero]')]
  for (const block of blocks) {
    if (block.dataset.hero in copy) block.textContent = copy[block.dataset.hero]
  }
  const named = blocks.map((block) => block.dataset.hero)
  return [
    ...named.filter((field) => !(field in copy)).map((field) => `the card asks for ${field}`),
    ...Object.keys(copy)
      .filter((field) => !named.includes(field))
      .map((field) => `nothing on the card carries ${field}`),
  ]
}, copy)

if (unfilled.length > 0) {
  await browser.close()
  fail(`The card and the hero do not agree: ${unfilled.join(', ')}.`)
}

// Text painted before the webfont arrives is text in a fallback typeface.
await page.evaluate(() => document.fonts.ready)

if (failed.length > 0) {
  console.error(
    [`The card could not load ${failed.length} of its assets:`, ...failed.map((url) => `  ${url}`)].join(
      '\n',
    ),
  )
  await browser.close()
  process.exit(1)
}

await page.locator('.card').screenshot({ path: target })
await browser.close()

const { size } = await stat(target)
console.log(
  `Rendered ${path.relative(repoRoot, target)} at ${width * scale}x${height * scale} ` +
    `(${width}x${height} at ${scale}x, ${Math.round(size / 1024)} kB), ` +
    `reading "${copy.name}: ${copy.text}" from the corpus home page.`,
)
