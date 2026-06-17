# @cosmicjs/rich-text

Official renderer for Cosmic `rich-text` metafields. Rich-text values are stored
as markdown prose interleaved with `{{shortcode}}` block tokens. Each block is
either a reusable snippet defined in your bucket settings (synced) or an editable
per-instance copy. This package parses the value, resolves blocks against their
definitions, and renders to React with an overridable component per block, or to
a plain HTML string via the React-free `@cosmicjs/rich-text/html` entry point.

## Install

```bash
npm install @cosmicjs/rich-text
```

`react` is a peer dependency.

## Usage

Pass the bucket's block definitions (`settings.content_blocks`) so `{{name}}`
tokens can be expanded.

```tsx
import { RichText } from '@cosmicjs/rich-text';

export default function Post({ post, blocks }) {
  return <RichText value={post.metadata.content} blocks={blocks} />;
}
```

### Overriding block rendering

By default each block renders as a `data-block` div wrapping its content. Provide
a `components` map keyed by block name to customize rendering.

```tsx
import { RichText, BlockProps } from '@cosmicjs/rich-text';

const Callout = ({ contentHtml }: BlockProps) => (
  <aside
    className="my-callout"
    dangerouslySetInnerHTML={{ __html: contentHtml }}
  />
);

<RichText value={value} blocks={blocks} components={{ callout: Callout }} />;
```

Each component receives `{ name, definition, contentHtml }`, where `contentHtml`
is the block's content already rendered to HTML: the inline content for an
editable instance, or the definition's content for a synced reference.

### Inline object embeds

A rich-text value can also reference a live Cosmic object inline with the
reserved `{{ object ... /}}` token (distinct from a block: the content lives in
the referenced object, not in bucket settings):

```
{{ object type="posts" id="64f0...abc" slug="hello-world" /}}
```

Render embeds by providing an `objects` component map (keyed by object type
slug) and a `resolveObject` function. Fetch the parent object with relationship
depth so the referenced objects are available, then resolve by `id`:

```tsx
import { RichText, ObjectBlockProps } from '@cosmicjs/rich-text';

const PostCard = ({ object }: ObjectBlockProps) =>
  object ? <a href={`/posts/${object.slug}`}>{object.title}</a> : null;

const related = post.metadata?.related ?? [];
const byId = new Map(related.map((o) => [o.id, o]));

<RichText
  value={value}
  blocks={blocks}
  objects={{ posts: PostCard }}
  resolveObject={({ id }) => byId.get(id)}
/>;
```

Each object component receives `{ id, type, slug, object }`. When no component is
registered for a type, a default placeholder renders (the reference is never
silently dropped).

### Imperative API

```tsx
import { renderRichText } from '@cosmicjs/rich-text';

const nodes = renderRichText(value, { blocks });
```

### Render to an HTML string (no React)

For non-React stacks (Vue, Svelte, Astro, server templates), import
`renderToHtml` from the `@cosmicjs/rich-text/html` entry point, which has no
React dependency. It returns a single HTML string.

```ts
import { renderToHtml } from '@cosmicjs/rich-text/html';

const html = renderToHtml(value, {
  blocks,
  // Optional: customize block markup.
  blockWrapper: ({ name, innerHtml }) =>
    `<aside class="block block-${name}">${innerHtml}</aside>`,
  // Optional: resolve inline object embeds to your own HTML.
  resolveObjectHtml: ({ id }) => byId.get(id)?.html,
});
```

By default blocks render to the same `data-block` wrapper as the React renderer,
and unresolved object embeds render to a `data-object` placeholder.

## Block definitions

A block definition has this shape (stored in `settings.content_blocks`):

```ts
interface BlockDefinition {
  name: string; // shortcode, e.g. "callout"
  title?: string;
  description?: string;
  content: string; // markdown, plain text, or raw HTML
  editor: 'rich-text' | 'plain' | 'html';
}
```

## Shortcode grammar

```
{{ name /}}                                      synced block reference
{{ name }}...{{/ name }}                          editable ("Edit on page") instance
{{ object type="posts" id="..." slug="..." /}}   inline object embed
```

A synced reference (`{{ name /}}`) resolves its content from the block
definition, so editing the saved block updates every synced instance. An
editable instance (`{{ name }}...{{/ name }}`) stores its content inline, so it
is unique to that value and no longer tracks the saved block. Unknown blocks (no
matching definition) are dropped unless `keepUnknown` is set. The `object` (and
`objects`) names are reserved for inline object embeds.

## Fetching block definitions

Rich-text values are served verbatim (markdown + `{{shortcode}}` tokens); the
API never pre-renders them. Fetch the bucket's block definitions once and reuse
them across objects. The easiest way is the official SDK:

```ts
import { createBucketClient } from '@cosmicjs/sdk';

const cosmic = createBucketClient({ bucketSlug, readKey });
const { blocks } = await cosmic.blocks.find();
```

Or call the endpoint directly:

```
GET buckets/{slug}/blocks   ->   { "blocks": [ ...BlockDefinition ] }
```

The endpoint is read-key authed and Fastly-cached on the bucket. The same data
is also available on the bucket object at `settings.content_blocks`. Pass the
result as the `blocks` prop above.
