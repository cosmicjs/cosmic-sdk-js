/**
 * A reusable Rich Text block definition, as stored in a bucket's
 * `settings.rich_text_blocks` and returned by `cosmic.blocks.find()`.
 * Inserting `{{name /}}` in a `rich-text` value expands to this block.
 *
 * This shape mirrors `BlockDefinition` from `@cosmicjs/rich-text` so the two
 * packages line up.
 */
export interface Block {
  name: string;
  title?: string;
  description?: string;
  content: string;
  editor: 'rich-text' | 'plain' | 'html';
}

export interface BlocksResponse {
  blocks: Block[];
}
