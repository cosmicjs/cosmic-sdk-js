import { GenericObject } from './generic.types';

export type InsertMediaType = {
  media: any;
  folder?: string;
  metadata?: GenericObject;
  trigger_webhook?: boolean;
};
