import * as React from 'react';

/**
 * A reusable Rich Text block definition, as stored in a bucket's
 * `settings.rich_text_blocks`. Inserting `{{name /}}` in a rich-text value
 * expands to this block's content.
 */
export interface BlockDefinition {
  name: string;
  title?: string;
  description?: string;
  content: string;
  editor: 'rich-text' | 'plain' | 'html';
}

export interface BlockProps {
  /** The block name, e.g. "callout". */
  name: string;
  /** The block definition (from bucket settings), if known. */
  definition?: BlockDefinition;
  /** The block's rendered content HTML. */
  contentHtml: string;
}

export type BlockComponents = Record<string, React.ComponentType<BlockProps>>;

/**
 * A resolved Cosmic object, as returned by the API. Only a few fields are used
 * by the default renderer; the full object is passed through to custom
 * components.
 */
export interface ResolvedObject {
  id: string;
  slug?: string;
  title?: string;
  type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Props for a component rendering an inline object embed ({{object ...}}). The
 * embedded object is referenced by id; `type`/`slug` come from the token and
 * `object` is the resolved record when a resolver/data was provided.
 */
export interface ObjectBlockProps {
  /** Object id (authoritative). */
  id: string;
  /** Object type slug from the token, if present. */
  type?: string;
  /** Object slug from the token, if present. */
  slug?: string;
  /** The resolved object, if available. */
  object?: ResolvedObject;
}

/** Override object-embed rendering per object type slug. */
export type ObjectComponents = Record<
  string,
  React.ComponentType<ObjectBlockProps>
>;

/** Default object-embed renderer: a data-object placeholder div. */
export const DefaultObjectBlock = ({ id, type, slug }: ObjectBlockProps) => (
  <div className="cosmic-object" data-object={id} data-object-type={type}>
    {slug || id}
  </div>
);

/** Escape plain-text block content, preserving line breaks. */
export function plainContentToHtml(content: string): string {
  return String(content || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, '<br>');
}

/** Default block renderer: wraps the rendered content in a data-block div. */
export const DefaultBlock = ({ name, contentHtml }: BlockProps) => (
  <div
    className={`cosmic-block cosmic-block-${name}`}
    data-block={name}
    dangerouslySetInnerHTML={{ __html: contentHtml }}
  />
);
