/**
 * Shortcode parser for Cosmic rich-text values. This is the same grammar used
 * by the editor (cosmic-dashboard) and the server-side expansion services
 * (cosmic-backend / cosmic-api):
 *
 *   self-closing:  {{ name key="value" /}}
 *   paired:        {{ name key="value" }} ...content... {{/ name }}
 */

export interface ShortcodeAttrs {
  [key: string]: string;
}

export interface ShortcodeToken {
  type: 'shortcode';
  name: string;
  attrs: ShortcodeAttrs;
  content?: string;
  paired: boolean;
  raw: string;
}

export interface TextSegment {
  type: 'text';
  value: string;
}

export type Segment = TextSegment | ShortcodeToken;

const NAME_RE = /[a-zA-Z][a-zA-Z0-9_-]*/;

interface RawTag {
  kind: 'open' | 'close' | 'selfClosing';
  name: string;
  attrs: ShortcodeAttrs;
  start: number;
  end: number;
  raw: string;
}

function parseAttributes(body: string): ShortcodeAttrs {
  const attrs: ShortcodeAttrs = {};
  const attrRe = /([a-zA-Z_:][\w:.-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(body)) !== null) {
    if (!match[1]) continue;
    attrs[match[1]] = match[3] ?? match[4] ?? '';
  }
  return attrs;
}

function readTag(input: string, index: number): RawTag | null {
  if (input[index] !== '{' || input[index + 1] !== '{') return null;
  const close = input.indexOf('}}', index + 2);
  if (close === -1) return null;

  let inner = input.slice(index + 2, close).trim();
  if (!inner) return null;

  let kind: RawTag['kind'] = 'open';
  if (inner.startsWith('/')) {
    kind = 'close';
    inner = inner.slice(1).trim();
  } else if (inner.endsWith('/')) {
    kind = 'selfClosing';
    inner = inner.slice(0, -1).trim();
  }

  const nameMatch = NAME_RE.exec(inner);
  if (!nameMatch || nameMatch.index !== 0) return null;
  const name = nameMatch[0];
  const body = inner.slice(name.length);
  if (kind === 'close' && body.trim()) return null;

  return {
    kind,
    name,
    attrs: kind === 'close' ? {} : parseAttributes(body),
    start: index,
    end: close + 2,
    raw: input.slice(index, close + 2),
  };
}

function pushText(segments: Segment[], value: string): void {
  if (!value) return;
  const last = segments[segments.length - 1];
  if (last && last.type === 'text') last.value += value;
  else segments.push({ type: 'text', value });
}

function findMatchingClose(input: string, opener: RawTag): RawTag | null {
  let depth = 1;
  let cursor = opener.end;
  while (cursor < input.length) {
    const next = input.indexOf('{{', cursor);
    if (next === -1) return null;
    const tag = readTag(input, next);
    if (!tag) {
      cursor = next + 2;
      continue;
    }
    if (tag.name === opener.name) {
      if (tag.kind === 'open') depth += 1;
      else if (tag.kind === 'close') {
        depth -= 1;
        if (depth === 0) return tag;
      }
    }
    cursor = tag.end;
  }
  return null;
}

export function parseShortcodes(input: string): Segment[] {
  const segments: Segment[] = [];
  if (!input) return segments;

  let i = 0;
  let textStart = 0;
  while (i < input.length) {
    if (input[i] === '{' && input[i + 1] === '{') {
      const tag = readTag(input, i);
      if (!tag) {
        i += 1;
        continue;
      }
      pushText(segments, input.slice(textStart, tag.start));

      if (tag.kind === 'selfClosing') {
        segments.push({
          type: 'shortcode',
          name: tag.name,
          attrs: tag.attrs,
          paired: false,
          raw: tag.raw,
        });
        i = tag.end;
        textStart = tag.end;
        continue;
      }
      if (tag.kind === 'open') {
        const closeTag = findMatchingClose(input, tag);
        if (!closeTag) {
          pushText(segments, tag.raw);
          i = tag.end;
          textStart = tag.end;
          continue;
        }
        segments.push({
          type: 'shortcode',
          name: tag.name,
          attrs: tag.attrs,
          content: input.slice(tag.end, closeTag.start),
          paired: true,
          raw: input.slice(tag.start, closeTag.end),
        });
        i = closeTag.end;
        textStart = closeTag.end;
        continue;
      }
      pushText(segments, tag.raw);
      i = tag.end;
      textStart = tag.end;
      continue;
    }
    i += 1;
  }
  pushText(segments, input.slice(textStart));
  return segments;
}
