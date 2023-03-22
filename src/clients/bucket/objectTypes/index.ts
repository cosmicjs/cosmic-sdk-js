import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { GenericObject } from '../../../types/generic.types';
import { requestHandler } from '../../../utils/request.handler';

let headers: GenericObject;
export const objectTypesChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  find() {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/object-types?read_key=${bucketConfig.readKey}`;
    return requestHandler(HTTP_METHODS.GET, endpoint);
  },

  findOne(slug: string) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/object-types/${slug}?read_key=${bucketConfig.readKey}`;
    return requestHandler(HTTP_METHODS.GET, endpoint);
  },

  async insertOne(data: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/object-types`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }
    return requestHandler(HTTP_METHODS.POST, endpoint, data, headers);
  },

  async updateOne(slug: string, updates: GenericObject) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/object-types/${slug}`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }

    return requestHandler(HTTP_METHODS.PATCH, endpoint, updates, headers);
  },

  async deleteOne(slug: string) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/object-types/${slug}`;
    if (bucketConfig.writeKey) {
      headers = {
        Authorization: `Bearer ${bucketConfig.writeKey}`,
      };
    }
    return requestHandler(HTTP_METHODS.DELETE, endpoint, null, headers);
  },
});
