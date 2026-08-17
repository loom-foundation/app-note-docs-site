// Copies the Foundation brand assets into the VitePress public directory.
//
// The favicon and the two wordmarks are owned by loom-foundation/org, which
// is their single source of truth. They are not tracked here: the npm
// `predocs:build` and `predocs:dev` hooks run this script, so an ordinary
// `npm run docs:build` or `npm run docs:dev` picks them up, and .gitignore
// keeps the copies out of the repository.
//
// The source is the sibling `org` checkout in the west workspace, the same
// assumption `docs/.vitepress/config.mts` already makes of the corpus.
import { copyFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// This repository sits at apps/<name> in the workspace, so `org` is two levels up.
const sourceDir = path.resolve(repoRoot, '../../org/brand/assets')
const targetDir = path.join(repoRoot, 'docs/.vitepress/public')

const assets = ['favicon.svg', 'loom-wordmark.svg', 'loom-wordmark-inverted.svg']

const missing = []
for (const asset of assets) {
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

await mkdir(targetDir, { recursive: true })
for (const asset of assets) {
  await copyFile(path.join(sourceDir, asset), path.join(targetDir, asset))
}
console.log(`Copied ${assets.length} brand assets from ${sourceDir}.`)
