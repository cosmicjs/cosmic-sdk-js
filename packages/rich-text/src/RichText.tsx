import * as React from 'react';
import { marked } from 'marked';
import { parseShortcodes } from './shortcode';
import {
  BlockComponents,
  BlockDefinition,
  BlockProps,
  DefaultBlock,
  DefaultObjectBlock,
  ObjectBlockProps,
  ObjectComponents,
  ResolvedObject,
  plainContentToHtml,
} from './blocks';

marked.setOptions({ gfm: true, breaks: false });

export interface RenderRichTextOptions {
  /**
   * Block definitions from the bucket's settings (`content_blocks`). Used to
   * resolve `{{name}}` shortcodes to their stored content. Without this, blocks
   * cannot be expanded.
   */
  blocks?: BlockDefinition[];
  /**
   * Override block rendering per block name. Values are React components
   * receiving { name, definition, contentHtml }. Defaults to a div wrapper.
   */
  components?: BlockComponents;
  /**
   * Render inline object embeds ({{object ...}}) per object type slug. Each
   * component receives { id, type, slug, object } where `object` is the
   * resolved record (see `resolveObject`). Defaults to a reference placeholder.
   */
  objects?: ObjectComponents;
  /**
   * Resolve an embedded object reference to its full record. The consumer
   * typically fetches the parent object with relationship depth and looks the
   * referenced object up by id here. Without this, embeds render with `object`
   * undefined (components can still render from the id/type/slug).
   */
  resolveObject?: (ref: {
    id: string;
    type?: string;
    slug?: string;
  }) => ResolvedObject | undefined;
  /**
   * Custom markdown renderer for prose and rich-text block content. Defaults to
   * `marked.parse`.
   */
  renderMarkdown?: (markdown: string) => string;
  /**
   * Render unknown blocks (no matching definition) as raw text instead of
   * dropping them. Defaults to false (dropped).
   */
  keepUnknown?: boolean;
}

const renderMarkdownDefault = (md: string): string =>
  md ? (marked.parse(md, { async: false }) as string) : '';

/**
 * Parse a Cosmic rich-text value (markdown + {{shortcode}} blocks) into React
 * nodes. Prose is rendered as HTML; blocks are resolved against the provided
 * block definitions and rendered with an overridable React component.
 */
export function renderRichText(
  value: string,
  options: RenderRichTextOptions = {}
): React.ReactNode[] {
  const {
    blocks = [],
    components,
    objects,
    resolveObject,
    renderMarkdown = renderMarkdownDefault,
    keepUnknown = false,
  } = options;

  const definitions = new Map<string, BlockDefinition>();
  for (const block of blocks) definitions.set(block.name, block);

  const segments = parseShortcodes(value || '');

  return segments.map((segment, index) => {
    if (segment.type === 'text') {
      const html = renderMarkdown(segment.value);
      if (!html) return null;
      return (
        <div
          key={index}
          className="cosmic-richtext-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    // Inline object embeds reference a live Cosmic Object, not a bucket block.
    if (segment.name === 'object') {
      const id = segment.attrs.id || '';
      const type = segment.attrs.type;
      const slug = segment.attrs.slug;
      const object = resolveObject?.({ id, type, slug });
      const ObjectComponent =
        (type && objects && objects[type]) || DefaultObjectBlock;
      const objectProps: ObjectBlockProps = { id, type, slug, object };
      return <ObjectComponent key={index} {...objectProps} />;
    }

    const definition = definitions.get(segment.name);

    // A paired block ({{name}}...{{/name}}) is a detached "Edit on page"
    // instance: its content lives inline in the value, not in the block
    // definition. Render that inline content (markdown). A self-closing
    // {{name /}} is a synced reference resolved from the definition.
    let contentHtml: string;
    if (segment.paired) {
      contentHtml = renderMarkdown(segment.content || '');
    } else if (!definition) {
      return keepUnknown ? (
        <React.Fragment key={index}>{segment.raw}</React.Fragment>
      ) : null;
    } else if (definition.editor === 'plain') {
      contentHtml = plainContentToHtml(definition.content);
    } else if (definition.editor === 'html') {
      // Raw HTML blocks render verbatim. Enable the `sanitize` option (or pass a
      // custom `renderMarkdown`) if block authors are not fully trusted.
      contentHtml = definition.content || '';
    } else {
      contentHtml = renderMarkdown(definition.content || '');
    }

    const Component =
      (components && components[segment.name]) || DefaultBlock;
    const props: BlockProps = {
      name: segment.name,
      definition,
      contentHtml,
      attrs: segment.attrs,
    };
    return <Component key={index} {...props} />;
  });
}

export interface RichTextProps extends RenderRichTextOptions {
  value: string;
  className?: string;
}

/** Convenience wrapper component around {@link renderRichText}. */
export function RichText({ value, className, ...options }: RichTextProps) {
  return (
    <div className={className ?? 'cosmic-richtext'}>
      {renderRichText(value, options)}
    </div>
  );
}
