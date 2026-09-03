import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject, NonEmptyObject } from '../../../types/generic.types';
import {
  encodedQueryParam,
  previewTokenParam,
} from '../../../utils/generic.utils';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindChaining from './lib/find.chaining';
import FindOneChaining from './lib/findOne.chaining';

export type BatchOperation = {
  method: 'add' | 'edit' | 'delete';
  object_id?: string;
  object?: GenericObject;
  trigger_webhook?: boolean;
};

let headers: GenericObject;

export const objectsChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  find<T = any>(query: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects?read_key=${bucketConfig.readKey}${previewTokenParam(
      bucketConfig.previewToken
    )}${encodedQueryParam(query)}`;
    return new FindChaining<T>(endpoint, bucketConfig);
  },

  findOne<TQuery extends Record<string, unknown>, TResult = any>(
    query: NonEmptyObject<TQuery>
  ) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects?read_key=${bucketConfig.readKey}&limit=1${previewTokenParam(
      bucketConfig.previewToken
    )}${encodedQueryParam(query)}`;
    return new FindOneChaining<TResult>(endpoint, bucketConfig);
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

  async batch(operations: BatchOperation[]) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/batch`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.POST, endpoint, { operations }, headers);
  },
});
