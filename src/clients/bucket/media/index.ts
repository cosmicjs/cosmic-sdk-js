import FormData from 'form-data';
import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject, NonEmptyObject } from '../../../types/generic.types';
import { InsertMediaType } from '../../../types/media.types';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindChaining from './lib/find.chaining';
import FindOneChaining from './lib/findOne.chaining';
import { encodedQueryParam } from '../../../utils/generic.utils';

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
    if (params.media.buffer) {
      data.append('media', params.media.buffer, params.media.originalname);
    } else {
      data.append('media', params.media, params.media.name);
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
    const getHeaders = (form: FormData): Promise<GenericObject> =>
      new Promise((resolve, reject) => {
        if (params.media.buffer) {
          form.getLength((err, length) => {
            if (err) reject(err);
            const h = { 'Content-Length': length, ...form.getHeaders() };
            resolve(h);
          });
        } else {
          resolve({ 'Content-Type': 'multipart/form-data' });
        }
      });
    return getHeaders(data)
      .then((h) => {
        const headersObj = h;
        if (bucketConfig.writeKey) {
          headersObj.Authorization = `Bearer ${bucketConfig.writeKey}`;
        }
        return requestHandler(HTTP_METHODS.POST, endpoint, data, headersObj);
      })
      .catch((error) => {
        throw error.response.data;
      });
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
