import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject, NonEmptyObject } from '../../../types/generic.types';
import { encodedQueryParam } from '../../../utils/generic.utils';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindChaining from './lib/find.chaining';
import FindOneChaining from './lib/findOne.chaining';

let headers: GenericObject;

export const objectsChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  find(query: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects?read_key=${bucketConfig.readKey}${encodedQueryParam(query)}`;
    return new FindChaining(endpoint, bucketConfig);
  },

  findOne<T extends Record<string, unknown>>(query: NonEmptyObject<T>) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects?read_key=${bucketConfig.readKey}&limit=1${encodedQueryParam(
      query
    )}`;
    return new FindOneChaining(endpoint, bucketConfig);
  },

  async insertOne(data: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.POST, endpoint, data, headers);
  },

  async updateOne(id: string, updates: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${id}`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.PATCH, endpoint, updates, headers);
  },

  async deleteOne(id: string, triggerWebhook = false) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects/${id}${triggerWebhook ? '?trigger_webhook=true' : ''}`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.DELETE, endpoint, null, headers);
  },
});
