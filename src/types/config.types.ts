export type APIConfig = {
  apiUrl: string;
  uploadUrl: string;
};
export type BucketConfig = {
  bucketSlug: string;
  readKey: string;
  writeKey?: string;
  apiVersion: 'v3';
  apiEnvironment: 'staging' | 'production';
  custom?: APIConfig;
};
