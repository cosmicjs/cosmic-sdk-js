# RFC: Rich-text blocks - rendering model, blocks endpoint, and `@cosmicjs/rich-text`

- Status: Approved - rolling out (GA)
- Author: Cosmic engineering
- Affected repos: `cosmic-api`, `cosmic-backend`, `cosmic-dashboard`, `cosmic-sdk-js`
- Related: `rich-text` metafield, Custom Blocks (bucket settings `rich_text_blocks`)

## Summary

The `rich-text` metafield stores markdown prose interleaved with `{{shortcode}}`
block tokens. Each token references a reusable **block** defined per bucket in
**Settings -> Custom Blocks** (`settings.rich_text_blocks`).

This RFC proposes a **control-first rendering model**:

1. The API serves `rich-text` values **verbatim**. It never expands tokens or
   attaches generated HTML to responses.
2. A dedicated, cacheable endpoint exposes block definitions:
   `GET buckets/{slug}/blocks`.
3. Consumers resolve tokens themselves, either with the official renderer
   (`@cosmicjs/rich-text`) or their own code.

**Decision (GA rollout):** all three are shipping. `@cosmicjs/rich-text` is being
published to npm as the official renderer (option A below), `publishConfig.access`
is set to `public`, and the docs reference it as the recommended path. The
remaining publish step (`npm publish` / changeset release) runs through the
normal release pipeline with npm credentials.

## Background

An earlier iteration prototyped **server-side expansion** (never released):
requesting an object with `?expand=blocks` added an `expanded_html` field next to
each `rich-text` metafield, containing sanitized `data-block` HTML rendered on
the server.

Problems with that approach:

- **Limited control.** Consumers want React-level (or framework-level) control
  over how each block renders. A server-rendered HTML blob forces
  `dangerouslySetInnerHTML` and discards component boundaries.
- **Duplicated, drift-prone logic.** The markdown renderer + block registry had
  to be reimplemented in `cosmic-api` and `cosmic-backend` as dependency-free JS,
  mirroring the dashboard/SDK implementation. Three copies, three chances to
  drift.
- **Caching ambiguity.** Expanded HTML is a function of both the object value and
  the bucket's block definitions, so object caches must also invalidate on block
  edits. Coupling them on the object response makes invalidation harder.
- **Payload bloat.** Every rich-text field carried a second, larger HTML copy.

## Proposal

### 1. Serve values verbatim (remove `expanded_html`)

Remove the `?expand=blocks` / `expanded_html` plumbing from object get/list on
both v2 (`cosmic-api/packages/api`) and v3 (`cosmic-api/packages/api-v3`), and
delete the server-side richText expansion service in `cosmic-api` and
`cosmic-backend`. Stored values are returned unchanged.

### 2. Dedicated blocks endpoint

```
GET buckets/{slug}/blocks   ->   200 { "blocks": [ ...BlockDefinition ] }
```

- **Auth:** read key (same as object reads).
- **Source:** `bucket.settings.rich_text_blocks` (returns `[]` if unset).
- **Caching:** Fastly-cached on the **bucket surrogate key**, so editing blocks
  invalidates the blocks response without touching object caches. Clients fetch
  it once and reuse it across many objects.
- **Versions:** available on both v2 and v3 for parity.

`BlockDefinition`:

```ts
interface BlockDefinition {
  name: string;        // shortcode slug, e.g. "callout"
  title?: string;
  description?: string;
  content: string;     // markdown, plain text, or raw HTML
  editor: 'rich-text' | 'plain' | 'html';
}
```

> The same definitions remain available on the bucket object at
> `settings.rich_text_blocks`. The dedicated endpoint exists so renderers can
> fetch just the blocks, with their own cache lifetime, instead of pulling the
> whole bucket.

### 3. Client-side rendering

Consumers resolve `{{shortcode}}` tokens against the fetched definitions:

- **Official renderer** `@cosmicjs/rich-text`: `<RichText value blocks={blocks} />`
  or `renderRichText(value, { blocks })`, with an overridable component per block
  (`components={{ callout: Callout }}`).
- **Bring your own**: the shortcode grammar + `data-block` HTML contract are
  documented; the parser is small and stable.

`data-block` contract (what the default renderer emits per block):

```html
<div class="cosmic-block cosmic-block-<name>" data-block="<name>">
  <!-- block content rendered to HTML (markdown or escaped plain text) -->
</div>
```

### 4. Inline object embeds (additive primitive)

Blocks are reusable, bucket-defined snippets. A distinct, additive primitive
lets authors reference a **live Cosmic Object** inline. This is not a block: the
content lives in the referenced object, not in bucket settings.

Canonical token: a reserved, self-closing `object` shortcode.

```
{{object type="posts" id="64f0...abc" slug="hello-world" /}}
```

- `id` is authoritative; `type` drives renderer dispatch and editor preview;
  `slug` aids readability/resilience.
- `object` (and `objects`) are reserved block names so a block can't shadow the
  token.
- Requires no parser changes (attrs already round-trip) and no server-side
  expansion: values are still served verbatim and the `GET /blocks` endpoint is
  unchanged.

Rendering stays control-first. `renderRichText` gains two options:

- `objects?: Record<string, React.ComponentType<ObjectBlockProps>>` keyed by
  object type slug.
- `resolveObject?: (ref: { id; type?; slug? }) => ResolvedObject | undefined` so
  the consumer (who already fetched the parent object, optionally with
  relationship depth) supplies resolution.

`ObjectBlockProps` is `{ id, type?, slug?, object? }`. When no component is
registered for a type, a `DefaultObjectBlock` placeholder renders (it never
silently drops the reference). Dashboard read-only/preview views render the same
kind of reference placeholder.

## `@cosmicjs/rich-text` (publish decision)

The package lives at `cosmic-sdk-js/packages/rich-text`, builds, and exposes
`RichText`, `renderRichText`, `BlockProps`, and `BlockDefinition`.

Options considered:

- **A. Publish as a standalone package (chosen).** Gives customers a first-class
  renderer immediately and matches the docs. We own support/versioning of a new
  public package.
- **B. Hold; ship docs + endpoint only.** Customers render with their own code
  against the documented grammar and the blocks endpoint.
- **C. Fold into `@cosmicjs/sdk`** as a subpath export (e.g.
  `@cosmicjs/sdk/blocks`).

**Decision: A.** For GA we publish the standalone package so adoption isn't
gated on customers hand-writing a parser. The endpoint + grammar remain the
stable integration surface, so a future move to (C) would be a re-export, not a
breaking change.

### Publish mechanics

- `publishConfig.access` is `public` (scoped package). Initial version `0.1.0`.
- Semver from `0.x`; treat the component `components` map and `BlockProps` as the
  primary stability surface.
- `react` stays a peer dependency; ships ESM + CJS + types.
- Release runs through the normal pipeline (build + `npm publish` / changeset)
  with npm credentials; not something done from a sandbox.
- Follow-up: pin the shortcode grammar as the cross-package source of truth
  (dashboard + SDK must stay byte-for-byte compatible; add a shared fixture
  test).

## Alternatives considered

- **Keep server-side expansion (status quo before this RFC).** Rejected for the
  control, drift, caching, and payload reasons above.
- **Expansion as an opt-in, separate field on a separate endpoint.** Still
  duplicates rendering logic server-side; client rendering already covers the
  "I want HTML" case via the renderer.

## Migration / compatibility

- **Not a breaking change.** `?expand=blocks` / `expanded_html` never shipped to
  production, so there are no external consumers to migrate and no deprecation
  window is needed. It is simply removed.
- No change to how values are stored. Existing `rich-text` content is unaffected.
- Dashboard editor is unaffected (it reads blocks from bucket settings directly).

## Resolved

- **Publish `@cosmicjs/rich-text`?** Yes - publish standalone for GA (option A). A
  later fold into `@cosmicjs/sdk` (C) stays open as a non-breaking re-export.

## Open questions

1. Should the blocks endpoint support filtering (e.g. `?name=callout`) or is the
   full list sufficient? (Lean: full list; it's small and cacheable.)
2. Do we want a non-React renderer (vanilla/string) in the same package for
   server components / other frameworks?
3. Should we add a shared grammar conformance test across dashboard + SDK to
   prevent drift?
