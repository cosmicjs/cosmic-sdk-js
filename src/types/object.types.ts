import { GenericObject } from './generic.types';

export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  type: string;
  content?: string;
  status?: string;
  created_at?: string;
  modified_at?: string;
  published_at?: string;
  thumbnail?: string;
  metadata?: GenericObject;
  [key: string]: any;
}

export interface CosmicMedia {
  id: string;
  name: string;
  original_name: string;
  size: number;
  type: string;
  bucket?: string;
  created_at?: string;
  folder?: string | null;
  url: string;
  imgix_url: string;
  alt_text?: string;
  metadata?: GenericObject;
  [key: string]: any;
}

/**
 * The generics below default to `any` so that untyped calls behave exactly as
 * they did before results were typed. Pass a generic (or `CosmicObject`) to opt
 * into checking, which also makes the `null` on single-item reads meaningful.
 */
export interface ObjectsResponse<T = any> {
  objects: T[];
  total?: number;
  limit?: number;
  [key: string]: any;
}

export interface ObjectResponse<T = any> {
  object: T | null;
  [key: string]: any;
}

export interface MediaListResponse<T = any> {
  media: T[];
  total?: number;
  limit?: number;
  [key: string]: any;
}

export interface MediaResponse<T = any> {
  media: T | null;
  [key: string]: any;
}

export interface RevisionsResponse<T = any> {
  revisions: T[];
  total?: number;
  [key: string]: any;
}

export interface RevisionResponse<T = any> {
  revision: T | null;
  [key: string]: any;
}
