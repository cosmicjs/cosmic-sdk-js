import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToHtml } from '../dist/html.mjs';

const blocks = [
  {
    name: 'cta',
    title: 'Call to action',
    editor: 'rich-text',
    content: '## Ready?\n\n[Start](https://app.cosmicjs.com)',
  },
  { name: 'note', title: 'Note', editor: 'plain', content: 'a < b & c' },
  { name: 'raw', title: 'Raw', editor: 'html', content: '<hr data-x="1">' },
];

test('renders prose markdown', () => {
  const html = renderToHtml('Hello **world**');
  assert.match(html, /<strong>world<\/strong>/);
});

test('synced reference resolves content from the block definition', () => {
  const html = renderToHtml('{{cta /}}', { blocks });
  assert.match(html, /class="cosmic-block cosmic-block-cta" data-block="cta"/);
  assert.match(html, /Ready\?/);
  assert.match(html, /href="https:\/\/app\.cosmicjs\.com"/);
});

test('detached (paired) block renders its inline content, not the definition', () => {
  const html = renderToHtml('{{cta}}Local **copy** only{{/cta}}', { blocks });
  assert.match(html, /class="cosmic-block cosmic-block-cta" data-block="cta"/);
  assert.match(html, /Local <strong>copy<\/strong> only/);
  // The definition content must NOT leak into a detached instance.
  assert.doesNotMatch(html, /Ready\?/);
});

test('detached block works even without a matching definition', () => {
  const html = renderToHtml('{{callout}}Just inline{{/callout}}', {
    blocks,
  });
  assert.match(
    html,
    /class="cosmic-block cosmic-block-callout" data-block="callout"/
  );
  assert.match(html, /Just inline/);
});

test('plain and html block editors are honored for synced refs', () => {
  const plain = renderToHtml('{{note /}}', { blocks });
  assert.match(plain, /a &lt; b &amp; c/);
  const raw = renderToHtml('{{raw /}}', { blocks });
  assert.match(raw, /<hr data-x="1">/);
});

test('unknown synced block is kept verbatim by default', () => {
  assert.equal(renderToHtml('{{missing /}}'), '{{missing /}}');
  assert.equal(renderToHtml('{{missing /}}', { keepUnknown: false }), '');
});

test('object embeds use the default placeholder', () => {
  const html = renderToHtml('{{object type="posts" id="abc" slug="hi" /}}');
  assert.match(
    html,
    /class="cosmic-object" data-object="abc" data-object-type="posts"/
  );
  assert.match(html, />hi</);
});

test('object embeds can be resolved to custom HTML', () => {
  const html = renderToHtml('{{object type="posts" id="abc" slug="hi" /}}', {
    resolveObjectHtml: ({ id, slug }) => `<a href="/posts/${slug}">${id}</a>`,
  });
  assert.equal(html, '<a href="/posts/hi">abc</a>');
});

test('block attrs are passed to a custom blockWrapper', () => {
  const html = renderToHtml('{{callout type="warning"}}Heads up{{/callout}}', {
    blockWrapper: ({ name, innerHtml, attrs }) =>
      `<aside class="${name} ${attrs.type || ''}">${innerHtml}</aside>`,
  });
  assert.match(html, /<aside class="callout warning"><p>Heads up<\/p>/);
});
