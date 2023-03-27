export function validateWriteKeyAndReturnHeaders(writeKey?: string) {
  if (writeKey && writeKey.trim()) {
    return {
      Authorization: `Bearer ${writeKey}`,
    };
  }
  throw new Error(`'writeKey' should be a valid string`);
}
