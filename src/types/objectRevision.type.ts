import { GenericObject } from './generic.types';

export type InsertObjectRevisionType = {
  title?: string;
  slug?: string;
  content?: string;
  publish_at?: number;
  unpublish_at?: number;
  metadata?: GenericObject;
  locale?: string;
  thumbnail?: string;
  trigger_webhook?: boolean;
  pretty?: boolean;
};
