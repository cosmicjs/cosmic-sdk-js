/**
 * Framework-agnostic entry point: `@cosmicjs/rich-text/html`.
 *
 * Exposes the HTML string renderer and shortcode parser with no React
 * dependency, for use in Vue, Svelte, Astro, server templates, or any non-React
 * stack. For React, import from the package root instead.
 */

export { renderToHtml } from './renderToHtml';
export type {
  RenderToHtmlOptions,
  BlockWrapperArgs,
  ObjectRef,
} from './renderToHtml';
export { plainContentToHtml } from './blockContent';
export type { BlockDefinition } from './blockContent';
export { parseShortcodes } from './shortcode';
export type {
  Segment,
  ShortcodeToken,
  TextSegment,
  ShortcodeAttrs,
} from './shortcode';
