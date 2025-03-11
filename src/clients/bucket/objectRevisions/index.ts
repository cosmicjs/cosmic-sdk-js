import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { InsertObjectRevisionType } from '../../../types/objectRevision.type';
import { GenericObject } from '../../../types/generic.types';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';
import FindOneChaining from './lib/findOne.chaining';
import FindChaining from './lib/find.chaining';

let headers: GenericObject;

export const objectRevisionsChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  find(objectId: string) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${objectId}/revisions?read_key=${bucketConfig.readKey}`;
    return new FindChaining(endpoint, bucketConfig);
  },

  findOne({ objectId, revisionId }: { objectId: string; revisionId: string }) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${objectId}/revisions/${revisionId}?read_key=${bucketConfig.readKey}`;
    return new FindOneChaining(endpoint, bucketConfig);
  },

  async insertOne(objectId: string, data: InsertObjectRevisionType) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${objectId}/revisions`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.POST, endpoint, data, headers);
  },
});
