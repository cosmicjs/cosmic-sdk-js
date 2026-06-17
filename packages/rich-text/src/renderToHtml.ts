import { marked } from 'marked';
import { parseShortcodes, ShortcodeAttrs } from './shortcode';
import { BlockDefinition, plainContentToHtml } from './blockContent';

/**
 * Framework-agnostic renderer: turns a Cosmic rich-text value (markdown +
 * {{shortcode}} tokens) into a single HTML string. Use this in non-React stacks
 * (Vue, Svelte, Astro, plain server templates) where {@link renderRichText} (a
 * React renderer) is not appropriate.
 *
 * Resolution mirrors the React renderer:
 *   - prose            -> markdown rendered to HTML
 *   - {{name /}}       -> synced reference, content resolved from the block
 *                         definition (bucket settings)
 *   - {{name}}...{{/}} -> detached "Edit on page" instance, inline content
 *                         rendered as markdown
 *   - {{object ... /}} -> resolved via `resolveObjectHtml`, else a placeholder
 */

marked.setOptions({ gfm: true, breaks: false });

const renderMarkdownDefault = (md: string): string =>
  md ? (marked.parse(md, { async: false }) as string) : '';

export interface ObjectRef {
  id: string;
  type?: string;
  slug?: string;
}

export interface BlockWrapperArgs {
  name: string;
  innerHtml: string;
  definition?: BlockDefinition;
  attrs: ShortcodeAttrs;
}

export interface RenderToHtmlOptions {
  /**
   * Block definitions from the bucket's settings (`content_blocks`). Used to
   * resolve synced `{{name /}}` references. Detached (paired) blocks do not
   * need a definition since their content is inline.
   */
  blocks?: BlockDefinition[];
  /** Custom markdown renderer for prose and block content. Defaults to marked. */
  renderMarkdown?: (markdown: string) => string;
  /**
   * Render an inline object embed ({{object ...}}) to an HTML string. Return
   * undefined to fall back to the default `data-object` placeholder.
   */
  resolveObjectHtml?: (ref: ObjectRef) => string | undefined;
  /**
   * Wrap a block's inner HTML. Defaults to the canonical
   * `<div class="cosmic-block cosmic-block-{name}" data-block="{name}">`.
   */
  blockWrapper?: (args: BlockWrapperArgs) => string;
  /**
   * Keep unknown blocks (no matching definition) as their raw token instead of
   * dropping them. Defaults to true so content is never silently lost.
   */
  keepUnknown?: boolean;
}

/** Escape a string for use as text content or a double-quoted attribute value. */
function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function defaultBlockWrapper({ name, innerHtml }: BlockWrapperArgs): string {
  const cls = escapeHtml(name);
  return `<div class="cosmic-block cosmic-block-${cls}" data-block="${cls}">${innerHtml}</div>`;
}

function defaultObjectHtml(ref: ObjectRef): string {
  return `<div class="cosmic-object" data-object="${escapeHtml(
    ref.id
  )}" data-object-type="${escapeHtml(ref.type || '')}">${escapeHtml(
    ref.slug || ref.id
  )}</div>`;
}

/**
 * Render a Cosmic rich-text value to an HTML string.
 */
export function renderToHtml(
  value: string,
  options: RenderToHtmlOptions = {}
): string {
  const {
    blocks = [],
    renderMarkdown = renderMarkdownDefault,
    resolveObjectHtml,
    blockWrapper = defaultBlockWrapper,
    keepUnknown = true,
  } = options;

  const definitions = new Map<string, BlockDefinition>();
  for (const block of blocks) definitions.set(block.name, block);

  const segments = parseShortcodes(value || '');

  return segments
    .map((segment) => {
      if (segment.type === 'text') {
        return renderMarkdown(segment.value);
      }

      // Inline object embeds reference a live Cosmic Object, not a bucket block.
      if (segment.name === 'object') {
        const ref: ObjectRef = {
          id: segment.attrs.id || '',
          type: segment.attrs.type,
          slug: segment.attrs.slug,
        };
        const resolved = resolveObjectHtml?.(ref);
        return resolved !== undefined ? resolved : defaultObjectHtml(ref);
      }

      const definition = definitions.get(segment.name);

      // Paired = detached "Edit on page" instance: inline content (markdown).
      let innerHtml: string;
      if (segment.paired) {
        innerHtml = renderMarkdown(segment.content || '');
      } else if (!definition) {
        return keepUnknown ? segment.raw : '';
      } else if (definition.editor === 'plain') {
        innerHtml = plainContentToHtml(definition.content);
      } else if (definition.editor === 'html') {
        innerHtml = definition.content || '';
      } else {
        innerHtml = renderMarkdown(definition.content || '');
      }

      return blockWrapper({
        name: segment.name,
        innerHtml,
        definition,
        attrs: segment.attrs,
      });
    })
    .join('');
}
