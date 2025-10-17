import { GenericObject } from './generic.types';

export type InsertMediaType = {
  // eslint-disable-next-line no-undef
  media: File | Blob | Buffer | { buffer: Buffer; originalname: string };
  filename?: string; // Optional: Used for Buffer in Node.js when media is just a Buffer
  contentType?: string; // Optional: Used for Buffer in Node.js when media is just a Buffer
  folder?: string;
  metadata?: GenericObject;
  trigger_webhook?: boolean;
};
