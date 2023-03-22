import apiConfigs from '../constants/env.constants';
import { APIConfig, BucketConfig } from '../types/config.types';

export function validateAndExtractAPIConfig(config: BucketConfig): APIConfig {
  if (config.custom) {
    if (!config.custom.apiUrl || !config.custom.uploadUrl) {
      throw new Error(`apiUrl or uploadUrl is missing from 'custom' option`);
    }

    return {
      apiUrl: config.custom.apiUrl,
      uploadUrl: config.custom.uploadUrl,
    };
  }
  if (!config.apiVersion || !['v3'].includes(config.apiVersion)) {
    throw new Error(`apiVersion value can only be from 'v1', 'v2' & 'v3'`);
  }
  if (
    !config.apiEnvironment ||
    !['production', 'staging'].includes(config.apiEnvironment)
  ) {
    throw new Error(
      `apiEnvironment value can only be from 'production' & 'staging'`
    );
  }

  return apiConfigs[config.apiEnvironment][config.apiVersion];
}
