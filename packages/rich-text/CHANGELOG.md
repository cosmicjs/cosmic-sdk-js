# @cosmicjs/rich-text

## 0.3.0

### Minor Changes

- cb87173: Add a framework-agnostic `renderToHtml` string renderer via the new `@cosmicjs/rich-text/html` entry point (no React dependency) for use in Vue, Svelte, Astro, and server templates. Also support editable ("Edit on page") blocks: paired `{{name}}...{{/name}}` tokens render their inline content instead of the block definition.
