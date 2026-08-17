// Where the sibling repositories this app reads sit.
//
// The docs source and the brand assets are owned by other repositories in the
// west workspace, so everything here has to start from the workspace root and
// descend. That root is found by walking up for west's own marker, the .west
// directory it writes when a workspace is registered, rather than by counting
// levels: a checkout of this repository sits at apps/<name> and a worktree of
// it sits under tmp/worktrees/<name>, and a relative climb that lands on the
// root from one lands short from the other.
//
// The paths below are the ones the manifest gives those projects. Nothing here
// reads the manifest to learn them: an app knows which corpus it renders, and
// what it must not assume is where the workspace begins.
import path from 'node:path'
import { existsSync } from 'node:fs'

export function workspaceRoot(from) {
  for (let dir = from; ; ) {
    if (existsSync(path.join(dir, '.west'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new Error(
        `No .west directory above ${from}. This app reads the docs from one ` +
          'sibling repository and the brand assets from another, so it has to be ' +
          'built inside a west workspace:\n\n' +
          '  cd path/to/loom-foundation && west update\n',
      )
    }
    dir = parent
  }
}

export function corpusDocs(from) {
  return path.join(workspaceRoot(from), 'corpora/note/docs')
}

export function brandAssets(from) {
  return path.join(workspaceRoot(from), 'org/brand/assets')
}
