import { BucketConfig } from '../../types/config.types';
import { validateAndExtractAPIConfig } from '../../utils/config.validation';
import { objectsChainMethods } from './objects';

export const createBucketClient = (bucketConfig: BucketConfig) => {
  const apiConfig = validateAndExtractAPIConfig(bucketConfig);

  return {
    objects: objectsChainMethods(bucketConfig, apiConfig),
  };
};

export default createBucketClient;
