import { GenericObject } from '../types/generic.types';

/**
 * A wrapper around fetch that handles the request and response.
 * @param method - The HTTP method to use.
 * @param url - The URL to send the request to.
 * @param data - The data to send with the request.
 * @param headers - The headers to send with the request.
 * @returns The response from the server.
 */
export async function requestHandler(
  method: string,
  url: string,
  data?: BodyInit | GenericObject | null,
  headers: Record<string, string> = {}
) {
  const body =
    typeof data === 'object' &&
    data != null &&
    data.constructor.name === 'FormData'
      ? (data as FormData)
      : JSON.stringify(data);

  const config = {
    method,
    headers,
    body,
  };

  if (typeof window === 'undefined') {
    config.headers['Accept-Encoding'] = 'gzip, deflate';
  }

  return fetch(url, config).then((response) => {
    if (response.ok) return response.json();
    throw response.json();
  });
}
