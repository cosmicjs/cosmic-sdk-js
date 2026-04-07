import { GenericObject } from './generic.types';

export type InsertMediaType = {
  media:
    | File // eslint-disable-line no-undef
    | Blob // eslint-disable-line no-undef
    | Buffer
    | { buffer: Buffer; originalname: string; type?: string };
  filename?: string; // Optional: Used for Buffer in Node.js when media is just a Buffer
  contentType?: string; // Optional: Used for Buffer in Node.js when media is just a Buffer
  folder?: string;
  metadata?: GenericObject;
  trigger_webhook?: boolean;
};
