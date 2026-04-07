import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject, NonEmptyObject } from '../../../types/generic.types';
import { InsertMediaType } from '../../../types/media.types';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindChaining from './lib/find.chaining';
import FindOneChaining from './lib/findOne.chaining';
import { encodedQueryParam } from '../../../utils/generic.utils';

const isNode = typeof window === 'undefined';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

function getMimeType(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

let headers: GenericObject;

export const mediaChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  find(query?: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/media?read_key=${bucketConfig.readKey}${encodedQueryParam(query)}`;
    return new FindChaining(endpoint);
  },

  findOne<T extends Record<string, unknown>>(query: NonEmptyObject<T>) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/media?read_key=${bucketConfig.readKey}&limit=1${encodedQueryParam(
      query
    )}`;
    return new FindOneChaining(endpoint);
  },

  async insertOne(params: InsertMediaType) {
    const endpoint = `${apiConfig.uploadUrl}/buckets/${bucketConfig.bucketSlug}/media`;
    const data = new FormData();

    if (isNode) {
      if (Buffer.isBuffer(params.media)) {
        const filename = params.filename || 'file';
        // eslint-disable-next-line no-undef
        const blob = new Blob([params.media], {
          type: params.contentType || getMimeType(filename),
        });
        data.append('media', blob, filename);
      } else if (
        typeof params.media === 'object' &&
        'buffer' in params.media &&
        Buffer.isBuffer((params.media as any).buffer)
      ) {
        const mediaObj = params.media as {
          buffer: Buffer;
          originalname: string;
          type?: string;
        };
        // eslint-disable-next-line no-undef
        const blob = new Blob([mediaObj.buffer], {
          type: mediaObj.type || getMimeType(mediaObj.originalname),
        });
        data.append('media', blob, mediaObj.originalname);
      } else {
        throw new Error(
          'In Node.js environment, media must be a Buffer or { buffer: Buffer, originalname: string }'
        );
      }
      // eslint-disable-next-line no-undef
    } else if (params.media instanceof File || params.media instanceof Blob) {
      const filename =
        // eslint-disable-next-line no-undef
        params.media instanceof File ? params.media.name : 'file';
      data.append('media', params.media, filename);
    } else {
      throw new Error('In browser environment, media must be a File or Blob');
    }

    if (bucketConfig.writeKey) {
      data.append('write_key', bucketConfig.writeKey);
    }
    if (params.folder) {
      data.append('folder', params.folder);
    }
    if (params.metadata) {
      data.append('metadata', JSON.stringify(params.metadata));
    }
    if (params.trigger_webhook) {
      data.append('trigger_webhook', params.trigger_webhook.toString());
    }

    const headersObj: GenericObject = {};
    if (bucketConfig.writeKey) {
      headersObj.Authorization = `Bearer ${bucketConfig.writeKey}`;
    }

    return requestHandler(HTTP_METHODS.POST, endpoint, data, headersObj);
  },

  async updateOne(id: string, updates: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/media/${id}`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.PATCH, endpoint, updates, headers);
  },

  async deleteOne(id: string, triggerWebhook = false) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/media/${id}${triggerWebhook ? '?trigger_webhook=true' : ''}`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.DELETE, endpoint, null, headers);
  },
});
