import { BucketConfig } from '../../types/config.types';
import { validateAndExtractAPIConfig } from '../../utils/config.validation';
import { mediaChainMethods } from './media';
import { objectsChainMethods } from './objects';
import { objectTypesChainMethods } from './objectTypes';
import { objectRevisionsChainMethods } from './objectRevisions';

export const createBucketClient = (config: BucketConfig) => {
  const bucketConfig: BucketConfig = {
    apiVersion: 'v3',
    apiEnvironment: 'production',
    ...config,
  };
  const apiConfig = validateAndExtractAPIConfig(bucketConfig);

  return {
    objects: objectsChainMethods(bucketConfig, apiConfig),
    objectTypes: objectTypesChainMethods(bucketConfig, apiConfig),
    objectRevisions: objectRevisionsChainMethods(bucketConfig, apiConfig),
    media: mediaChainMethods(bucketConfig, apiConfig),
  };
};

export default createBucketClient;
