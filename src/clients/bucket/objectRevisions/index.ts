import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { InsertObjectRevisionType } from '../../../types/objectRevision.type';
import { GenericObject } from '../../../types/generic.types';
import { requestHandler } from '../../../utils/request.handler';
import { validateWriteKeyAndReturnHeaders } from '../../../utils/writeKey.validation';

let headers: GenericObject;

export const objectRevisionsChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  async insertOne(objectId: string, data: InsertObjectRevisionType) {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/objects/${objectId}/revisions`;
    headers = validateWriteKeyAndReturnHeaders(bucketConfig.writeKey);
    return requestHandler(HTTP_METHODS.POST, endpoint, data, headers);
  },
});
