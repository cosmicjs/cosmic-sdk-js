/**
 * React-free block primitives shared by the React renderer ({@link ./blocks})
 * and the framework-agnostic string renderer ({@link ./renderToHtml}). Keeping
 * these here (with no `react` import) lets the `@cosmicjs/rich-text/html` entry
 * point be consumed without React installed.
 */

/**
 * A reusable Rich Text block definition, as stored in a bucket's
 * `settings.content_blocks`. Inserting `{{name /}}` in a rich-text value
 * expands to this block's content.
 */
export interface BlockDefinition {
  name: string;
  title?: string;
  description?: string;
  content: string;
  editor: 'rich-text' | 'plain' | 'html';
}

/** Escape plain-text block content, preserving line breaks. */
export function plainContentToHtml(content: string): string {
  return String(content || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, '<br>');
}
