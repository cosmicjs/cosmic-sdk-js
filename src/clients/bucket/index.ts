import { BucketConfig } from '../../types/config.types';
import { validateAndExtractAPIConfig } from '../../utils/config.validation';
import { objectsChainMethods } from './objects';

export const createBucketClient = (config: BucketConfig) => {
  const bucketConfig: BucketConfig = {
    apiVersion: 'v3',
    apiEnvironment: 'production',
    ...config,
  };
  const apiConfig = validateAndExtractAPIConfig(bucketConfig);

  return {
    objects: objectsChainMethods(bucketConfig, apiConfig),
  };
};

export default createBucketClient;
