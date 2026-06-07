# @cosmicjs/rich-text

Official React renderer for Cosmic `rich-text` metafields. Rich-text values are
stored as markdown prose interleaved with `{{shortcode}}` block tokens. Each
block is a reusable content snippet defined in your bucket settings. This package
parses the value, resolves blocks against their definitions, and renders to
React, with an overridable component per block.

## Install

```bash
npm install @cosmicjs/rich-text
```

`react` is a peer dependency.

## Usage

Pass the bucket's block definitions (`settings.rich_text_blocks`) so `{{name}}`
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
is the block's content already rendered to HTML (markdown or plain text).

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

## Block definitions

A block definition has this shape (stored in `settings.rich_text_blocks`):

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
{{ name /}}                                  block reference
{{ object type="posts" id="..." slug="..." /}}   inline object embed
```

Blocks reference content by name; the content lives in the block definition.
Unknown blocks (no matching definition) are dropped unless `keepUnknown` is set.
The `object` (and `objects`) names are reserved for inline object embeds.

## Fetching block definitions

Rich-text values are served verbatim (markdown + `{{shortcode}}` tokens); the
API never pre-renders them. Fetch the bucket's block definitions once and reuse
them across objects:

```
GET buckets/{slug}/blocks   ->   { "blocks": [ ...BlockDefinition ] }
```

The endpoint is read-key authed and Fastly-cached on the bucket. The same data
is also available on the bucket object at `settings.rich_text_blocks`. Pass the
result as the `blocks` prop above.
