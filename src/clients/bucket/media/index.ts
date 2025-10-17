import NodeFormData from 'form-data';
import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject, NonEmptyObject } from '../../../types/generic.types';
import { InsertMediaType } from '../../../types/media.types';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindChaining from './lib/find.chaining';
import FindOneChaining from './lib/findOne.chaining';
import { encodedQueryParam } from '../../../utils/generic.utils';

// Environment detection
const isNode = typeof window === 'undefined';

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

    if (isNode) {
      // Node.js environment - use form-data package
      const data = new NodeFormData();

      // Handle different Buffer formats
      if (Buffer.isBuffer(params.media)) {
        // Direct Buffer - use filename and contentType from params
        data.append('media', params.media, {
          filename: params.filename || 'file',
          contentType: params.contentType || 'application/octet-stream',
        });
      } else if (
        typeof params.media === 'object' &&
        'buffer' in params.media &&
        Buffer.isBuffer(params.media.buffer)
      ) {
        // Handle { buffer: Buffer, originalname: string } format
        data.append('media', params.media.buffer, params.media.originalname);
      } else {
        throw new Error(
          'In Node.js environment, media must be a Buffer or { buffer: Buffer, originalname: string }'
        );
      }

      // Append other fields
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

      // Get proper headers for Node.js FormData
      return new Promise((resolve, reject) => {
        data.getLength((err, length) => {
          if (err) {
            reject(err);
            return;
          }

          const headersObj: GenericObject = {
            'Content-Length': length,
            ...data.getHeaders(),
          };

          if (bucketConfig.writeKey) {
            headersObj.Authorization = `Bearer ${bucketConfig.writeKey}`;
          }

          requestHandler(HTTP_METHODS.POST, endpoint, data, headersObj)
            .then(resolve)
            .catch((error) => {
              reject(error.response?.data || error);
            });
        });
      });
    }
    // Browser environment - use native FormData
    const data = new FormData();

    // Expect File or Blob
    // eslint-disable-next-line no-undef
    if (params.media instanceof File || params.media instanceof Blob) {
      const filename =
        // eslint-disable-next-line no-undef
        params.media instanceof File ? params.media.name : 'file';
      data.append('media', params.media, filename);
    } else {
      throw new Error('In browser environment, media must be a File or Blob');
    }

    // Append other fields
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

    const headersObj: GenericObject = {
      // Let browser set Content-Type with boundary automatically
    };

    if (bucketConfig.writeKey) {
      headersObj.Authorization = `Bearer ${bucketConfig.writeKey}`;
    }

    return requestHandler(HTTP_METHODS.POST, endpoint, data, headersObj).catch(
      (error) => {
        throw error.response?.data || error;
      }
    );
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
