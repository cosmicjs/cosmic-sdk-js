import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject } from '../../../types/generic.types';
import { requestHandler } from '../../../utils/request.handler';
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
    }/objects?read_key=${bucketConfig.readKey}${
      query ? `&query=${encodeURI(JSON.stringify(query))}` : ''
    }`;
    return new FindChaining(endpoint);
  },

  findOne(query: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects?read_key=${bucketConfig.readKey}&limit=1${
      query ? `&query=${encodeURI(JSON.stringify(query))}` : ''
    }`;
    return new FindOneChaining(endpoint);
  },

  async insertOne(data: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }
    return requestHandler(HTTP_METHODS.POST, endpoint, data, headers);
  },

  async updateOne(id: string, updates: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${id}`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }
    return requestHandler(HTTP_METHODS.PATCH, endpoint, updates, headers);
  },

  async deleteOne(id: string, triggerWebhook = false) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${
      bucketConfig.bucketSlug
    }/objects/${id}${triggerWebhook ? '?trigger_webhook=true' : ''}`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }
    return requestHandler(HTTP_METHODS.DELETE, endpoint, null, headers);
  },
});
