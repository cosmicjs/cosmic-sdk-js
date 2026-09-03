---
"@cosmicjs/sdk": patch
---

Publish only `dist`. The tarball previously shipped 59 files (1.4 MB unpacked) including lockfiles, internal docs, local test scripts, editor/tooling dotfiles, and a nested copy of `packages/rich-text` with its `marked` dependency. It is now 6 files (61.7 kB unpacked). Also adds an `exports` map and `sideEffects: false` for correct ESM/CJS resolution and tree-shaking.
