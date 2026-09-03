<p align="center">
  <a href="https://www.cosmicjs.com">
    <img src="https://cdn.cosmicjs.com/a28c6df0-c98c-11ed-b01d-23d7b265c299-cosmicwordmarkonlight.svg" alt="Cosmic" height="50" />
  </a>
</p>

<h1 align="center">Cosmic JavaScript SDK</h1>

<p align="center">
  The official client for <a href="https://www.cosmicjs.com/">Cosmic</a>. Fetch content, manage media, and generate AI in Next.js, Node, and the browser.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@cosmicjs/sdk"><img src="https://img.shields.io/npm/v/@cosmicjs/sdk.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@cosmicjs/sdk"><img src="https://img.shields.io/npm/dw/@cosmicjs/sdk.svg" alt="npm downloads" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-3178c6.svg" alt="TypeScript" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node.js >= 18" /></a>
  <a href="https://github.com/cosmicjs/cosmic-sdk-js/actions/workflows/main.yml"><img src="https://github.com/cosmicjs/cosmic-sdk-js/actions/workflows/main.yml/badge.svg" alt="Package Checks" /></a>
  <a href="https://github.com/cosmicjs/cosmic-sdk-js/blob/HEAD/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="https://app.cosmicjs.com/signup">Get started free</a> ·
  <a href="https://www.cosmicjs.com/docs/quickstart">Quickstart</a> ·
  <a href="https://www.cosmicjs.com/docs/examples">Examples</a> ·
  <a href="https://www.cosmicjs.com/headless-cms-for-nextjs">Next.js guide</a>
</p>

[Cosmic](https://www.cosmicjs.com/) is a [headless CMS](https://www.cosmicjs.com/headless-cms) with a dashboard for creating content and an API for delivering it to any website or application. This package is the official TypeScript client: typed results, zero runtime dependencies, works in Next.js, Node.js 18+, and the browser.

## Quick start

Install the SDK, add your Bucket keys from _Bucket > Settings > API Access_, and fetch content in a Next.js App Router page.

```bash
npm install @cosmicjs/sdk
```

```env
COSMIC_BUCKET_SLUG=your-bucket-slug
COSMIC_READ_KEY=your-read-key
```

```tsx
import { createBucketClient } from '@cosmicjs/sdk';

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
});

export default async function HomePage() {
  const { objects: posts } = await cosmic.objects
    .find({ type: 'posts' })
    .props(['id', 'slug', 'title', 'metadata'])
    .limit(10);

  return (
    <main>
      <h1>Latest posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

Pass a type parameter when you want a specific shape: `find<Post>({ type: 'posts' })`.

[Browse starter apps →](https://www.cosmicjs.com/docs/examples)

## Install

```bash
npm install @cosmicjs/sdk
# or
yarn add @cosmicjs/sdk
# or
bun add @cosmicjs/sdk
```

```js
import { createBucketClient } from '@cosmicjs/sdk';
```

## Contents

- [Authentication](#authentication)
- [Get Objects](#get-objects)
- [Create, update, and delete Objects](#create-update-and-delete-objects)
- [Media](#media)
- [Object types](#object-types)
- [Revisions](#revisions)
- [Rich text and blocks](#rich-text-and-blocks)
- [AI](#ai)
- [Learn more](#learn-more)

## Authentication

In the [Cosmic admin dashboard](https://app.cosmicjs.com/login) go to _Bucket > Settings > API Access_ and copy your Bucket slug and keys.

```js
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  readKey: process.env.COSMIC_READ_KEY,
});
```

Add `writeKey` for create, update, delete, media uploads, and AI. Never expose a write key in client-side code.

```js
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  readKey: process.env.COSMIC_READ_KEY,
  writeKey: process.env.COSMIC_WRITE_KEY,
});
```

Add `previewToken` to read drafts in [live preview](https://www.cosmicjs.com/docs/api/preview) without a write key.

```js
const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG,
  readKey: process.env.COSMIC_READ_KEY,
  previewToken: process.env.COSMIC_PREVIEW_TOKEN,
});
```

## Get Objects

Objects are the basic building blocks of content in Cosmic. Pass a generic to type the result, or use `CosmicObject` for the common fields.

### Get multiple Objects [[see docs](https://www.cosmicjs.com/docs/api/objects#get-objects)]

```js
const { objects: posts } = await cosmic.objects
  .find({
    type: 'posts',
  })
  .props(['title', 'slug', 'metadata'])
  .limit(10);
```

### Get a single Object [[see docs](https://www.cosmicjs.com/docs/api/objects#get-a-single-object-by-slug)]

```js
const { object: page } = await cosmic.objects
  .findOne({
    type: 'pages',
    slug: 'home',
  })
  .props(['title', 'slug', 'metadata']);
```

### Typed results

```ts
type Post = {
  title: string;
  slug: string;
  metadata: { excerpt: string };
};

const { objects } = await cosmic.objects
  .find<Post>({ type: 'posts' })
  .props(['title', 'slug', 'metadata']);
```

### Query helpers

Chain these on `find` and `findOne`:

| Method | Purpose |
| --- | --- |
| `.props(['title', 'slug'])` | Return only the listed fields |
| `.limit(10)` | Page size (`find` only) |
| `.skip(20)` | Offset for pagination |
| `.sort('-created_at')` | Sort by field. Prefix `-` for descending |
| `.depth(1)` | Resolve nested Object references |
| `.status('published')` | `published`, `draft`, or `any` |
| `.after(id)` | Cursor pagination |
| `.useCache()` | Enable the Cosmic CDN cache |

## Create, update, and delete Objects

Requires a `writeKey`.

### Create Object [[see docs](https://www.cosmicjs.com/docs/api/objects#create-an-object)]

```js
await cosmic.objects.insertOne({
  title: 'Blog Post Title',
  type: 'posts',
  metadata: {
    content: 'Here is the blog post content.',
    seo_description: 'This is the blog post SEO description.',
    featured_post: true,
    tags: ['javascript', 'cms'],
  },
});
```

### Update Object [[see docs](https://www.cosmicjs.com/docs/api/objects#update-an-object)]

```js
await cosmic.objects.updateOne('object-id', {
  metadata: {
    content: 'Updated blog post content.',
    featured_post: false,
  },
});
```

### Delete Object [[see docs](https://www.cosmicjs.com/docs/api/objects#delete-an-object)]

```js
await cosmic.objects.deleteOne('object-id');
```

### Batch operations [[see docs](https://www.cosmicjs.com/docs/api/objects#batch-operations)]

Create, update, and delete up to 25 Objects in one call. Each operation succeeds or fails independently.

```js
const result = await cosmic.objects.batch([
  { method: 'add', object: { title: 'Post 1', type: 'posts', metadata: { content: '...' } } },
  { method: 'edit', object_id: 'object-id', object: { title: 'Updated Title' } },
  { method: 'delete', object_id: 'another-object-id' },
]);
```

## Media

Upload, list, and delete files in the Media Library. [[see docs](https://www.cosmicjs.com/docs/api/media)]

```js
const { media } = await cosmic.media
  .find({ folder: 'images' })
  .props(['name', 'url', 'imgix_url'])
  .limit(20);

const { media: file } = await cosmic.media.findOne({ name: 'hero.png' });

await cosmic.media.insertOne({
  media: bufferOrFile,
  folder: 'images',
});

await cosmic.media.updateOne('media-id', { alt_text: 'Hero image' });
await cosmic.media.deleteOne('media-id');
```

Uploaded images include an `imgix_url` for resizing and optimization.

## Object types

Read and manage the content model. [[see docs](https://www.cosmicjs.com/docs/api/object-types)]

```js
const { object_types } = await cosmic.objectTypes.find();
const { object_type } = await cosmic.objectTypes.findOne('posts');

await cosmic.objectTypes.insertOne({ title: 'Authors', slug: 'authors' });
await cosmic.objectTypes.updateOne('authors', { title: 'Writers' });
await cosmic.objectTypes.deleteOne('authors');
```

## Revisions

List and restore Object revisions. Combine with `previewToken` to preview drafts. [[see docs](https://www.cosmicjs.com/docs/api/revisions)]

```js
const { revisions } = await cosmic.objectRevisions.find('object-id');
const { revision } = await cosmic.objectRevisions.findOne({
  objectId: 'object-id',
  revisionId: 'revision-id',
});
```

## Rich text and blocks

Fetch Rich Text block definitions and render them with [`@cosmicjs/rich-text`](https://www.npmjs.com/package/@cosmicjs/rich-text). [[see docs](https://www.cosmicjs.com/docs/api/rich-text)]

```bash
npm install @cosmicjs/rich-text
```

```tsx
import { createBucketClient } from '@cosmicjs/sdk';
import { RichText } from '@cosmicjs/rich-text';

const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
});

const [{ object: post }, { blocks }] = await Promise.all([
  cosmic.objects.findOne({ type: 'posts', slug: 'hello-world' }),
  cosmic.blocks.find(),
]);

export default function Post() {
  return <RichText value={post?.metadata.content} blocks={blocks} />;
}
```

## AI

Generate text, images, video, and audio. Requires a `writeKey`. [[see docs](https://www.cosmicjs.com/docs/api/ai)]

### Text

```js
const { text, usage } = await cosmic.ai.generateText({
  prompt: 'Write a product description for a coffee mug',
  max_tokens: 500,
});
```

Stream tokens as they arrive. `stream: true` returns a `TextStreamingResponse`; no cast needed.

```js
const stream = await cosmic.ai.generateText({
  prompt: 'Tell me about coffee mugs',
  stream: true,
});

for await (const chunk of stream) {
  if (chunk.text) process.stdout.write(chunk.text);
}
```

Or use `cosmic.ai.stream({ prompt })`. Analyze images by passing `media_url` with your prompt.

### Image, video, and audio

```js
const image = await cosmic.ai.generateImage({
  prompt: 'A serene mountain landscape at sunset',
  folder: 'ai-generated-images',
});

const video = await cosmic.ai.generateVideo({
  prompt: 'Product rotates smoothly with soft studio lighting',
  duration: 8,
  resolution: '720p',
});

const extended = await cosmic.ai.extendVideo({
  media_id: video.media.id,
  prompt: 'The camera pulls back to reveal the full scene',
});

const audio = await cosmic.ai.generateAudio({
  prompt: 'Welcome to the Cosmic Developer Podcast.',
  voice: 'nova',
});
```

Generated files are saved to your Media Library with CDN URLs. See the [AI Video Generation Guide](https://github.com/cosmicjs/cosmic-sdk-js/blob/HEAD/docs/AI_VIDEO_GENERATION.md) for models, duration, and extension details, and [`examples/`](https://github.com/cosmicjs/cosmic-sdk-js/tree/HEAD/examples) for runnable scripts.

## Learn more

- [Docs](https://www.cosmicjs.com/docs)
- [Quickstart](https://www.cosmicjs.com/docs/quickstart)
- [Next.js](https://www.cosmicjs.com/headless-cms-for-nextjs)
- [Examples](https://www.cosmicjs.com/docs/examples)
- [CLI](https://www.cosmicjs.com/docs/cli)
- [MCP server](https://www.cosmicjs.com/docs/mcp-server)
- [API reference](https://www.cosmicjs.com/docs/api)

## Community support

- [Discord](https://discord.gg/MSCwQ7D6Mg) (questions, bug reports)
- [GitHub](https://github.com/cosmicjs/cosmic-sdk-js) (issues, contributions)
- [X](https://x.com/cosmicjs) (product updates)
- [YouTube](https://www.youtube.com/cosmicjs) (video tutorials)

## Cosmic support

[Contact us](https://www.cosmicjs.com/contact) for service questions and custom plans.

## Contributing

This project uses [changeset](https://www.npmjs.com/package/@changesets/cli) to manage releases. Follow the following steps to add a changeset:

- Run `npm run changeset` command and select type of release with description of changes.
- When PR with changeset is merged into `main` branch, Github will create a new PR with correct version change and changelog edits.
- When `codeowner` merges the generated PR, it will publish the package and create a Github release.

## License

This project is published under the [MIT](https://github.com/cosmicjs/cosmic-sdk-js/blob/HEAD/LICENSE) license.
