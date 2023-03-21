import axios, { AxiosRequestConfig, Method } from 'axios';

/**
 * Initialize the API with the given config.
 * @returns None
 */
export const init = () => {
  // Accept Encoding in Node
  if (typeof window === 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip, deflate';
  }
};

/**
 * A wrapper around axios that handles the request and response.
 * @param method - The HTTP method to use.
 * @param url - The URL to send the request to.
 * @param data - The data to send with the request.
 * @param headers - The headers to send with the request.
 * @returns The response from the server.
 */
export const requestHandler = (
  method: string,
  url: string,
  data?: any,
  headers?: any
) => {
  const config: AxiosRequestConfig = {
    method: method as Method,
    url,
    data,
    headers,
  };
  return axios(config)
    .then((response) => response.data)
    .catch((error) => {
      throw error.response ? error.response.data : error.response;
    });
};
