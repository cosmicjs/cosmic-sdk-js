import HTTP_METHODS from '../../../constants/httpMethods.constants';
import { APIConfig, BucketConfig } from '../../../types/config.types';
import { BlocksResponse } from '../../../types/blocks.types';
import { requestHandler } from '../../../utils/request.handler';

export const blocksChainMethods = (
  bucketConfig: BucketConfig,
  apiConfig: APIConfig
) => ({
  /**
   * Fetch the bucket's Rich Text block definitions
   * (`settings.content_blocks`). Pass the result to a rich-text renderer
   * such as `@cosmicjs/rich-text` to expand `{{name /}}` block tokens.
   */
  find(): Promise<BlocksResponse> {
    const endpoint = `${apiConfig.apiUrl}/buckets/${bucketConfig.bucketSlug}/blocks?read_key=${bucketConfig.readKey}`;
    return requestHandler(HTTP_METHODS.GET, endpoint);
  },
});
