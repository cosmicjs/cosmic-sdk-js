import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderRichText,
  renderToHtml,
  DefaultBlock,
  DefaultObjectBlock,
} from '../dist/index.mjs';

// A realistic value as the dashboard would store it: markdown prose, a synced
// block reference, a detached ("Edit on page") block with inline content, a
// synced plain-text block, a synced HTML block, and an inline object embed.
const value = `# Cosmic

Intro with **bold** text.

{{cta /}}

{{callout}}
This copy is **unique** to this page.
{{/callout}}

{{legal /}}

{{widget /}}

Related post:

{{object type="posts" id="p1" slug="hello-world" /}}
`;

const blocks = [
  {
    name: 'cta',
    title: 'CTA',
    editor: 'rich-text',
    content: '## Ready?\n\n[Sign up](https://app.cosmicjs.com)',
  },
  { name: 'legal', title: 'Legal', editor: 'plain', content: 'Tom & Jerry <3' },
  {
    name: 'widget',
    title: 'Widget',
    editor: 'html',
    content: '<iframe src="https://example.com"></iframe>',
  },
];

// ---------------------------------------------------------------------------
// String renderer (@cosmicjs/rich-text/html)
// ---------------------------------------------------------------------------

test('renderToHtml renders a full document end to end', () => {
  const html = renderToHtml(value, { blocks });

  // Prose markdown.
  assert.match(html, /<h1[^>]*>Cosmic<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);

  // Synced rich-text block resolves from the definition.
  assert.match(html, /cosmic-block cosmic-block-cta/);
  assert.match(html, /Ready\?/);
  assert.match(html, /href="https:\/\/app\.cosmicjs\.com"/);

  // Detached block renders its inline content, not a definition.
  assert.match(html, /cosmic-block cosmic-block-callout/);
  assert.match(html, /This copy is <strong>unique<\/strong> to this page\./);

  // Plain block is HTML-escaped; HTML block renders verbatim.
  assert.match(html, /Tom &amp; Jerry &lt;3/);
  assert.match(html, /<iframe src="https:\/\/example\.com"><\/iframe>/);

  // Object embed placeholder.
  assert.match(
    html,
    /cosmic-object" data-object="p1" data-object-type="posts"/
  );
});

test('renderToHtml resolves object embeds when given a resolver', () => {
  const html = renderToHtml(value, {
    blocks,
    resolveObjectHtml: ({ id, slug }) =>
      `<a data-id="${id}" href="/posts/${slug}">read</a>`,
  });
  assert.match(html, /<a data-id="p1" href="\/posts\/hello-world">read<\/a>/);
});

// ---------------------------------------------------------------------------
// React renderer (@cosmicjs/rich-text) - inspect the element tree (no DOM)
// ---------------------------------------------------------------------------

const nonNull = (nodes) => nodes.filter(Boolean);

test('renderRichText returns React nodes for each segment', () => {
  const nodes = nonNull(renderRichText(value, { blocks }));

  const cta = nodes.find((n) => n.type === DefaultBlock && n.props.name === 'cta');
  assert.ok(cta, 'cta block element present');
  assert.match(cta.props.contentHtml, /Ready\?/);

  const callout = nodes.find(
    (n) => n.type === DefaultBlock && n.props.name === 'callout'
  );
  assert.ok(callout, 'detached callout element present');
  // Inline content, rendered as markdown - not the (absent) definition.
  assert.match(callout.props.contentHtml, /<strong>unique<\/strong>/);

  const legal = nodes.find(
    (n) => n.type === DefaultBlock && n.props.name === 'legal'
  );
  assert.match(legal.props.contentHtml, /Tom &amp; Jerry &lt;3/);

  const obj = nodes.find((n) => n.type === DefaultObjectBlock);
  assert.ok(obj, 'object embed element present');
  assert.equal(obj.props.id, 'p1');
  assert.equal(obj.props.type, 'posts');
});

test('renderRichText passes the resolved object to the component', () => {
  const post = { id: 'p1', slug: 'hello-world', title: 'Hello World' };
  const nodes = nonNull(
    renderRichText(value, { blocks, resolveObject: ({ id }) => (id === 'p1' ? post : undefined) })
  );
  const obj = nodes.find((n) => n.type === DefaultObjectBlock);
  assert.deepEqual(obj.props.object, post);
});

test('unknown synced blocks are dropped unless keepUnknown is set', () => {
  const v = 'before {{nope /}} after';
  const dropped = nonNull(renderRichText(v, { blocks }));
  assert.ok(
    !dropped.some((n) => n.type === DefaultBlock),
    'no block element for unknown synced reference'
  );
  const kept = renderToHtml(v, { blocks });
  assert.match(kept, /\{\{nope \/\}\}/);
});
