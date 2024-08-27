import { GenericObject } from './generic.types';

export type InsertMediaType = {
  media: any;
  folder?: string;
  alt_text?: string;
  metadata?: GenericObject;
  trigger_webhook?: boolean;
};
