import axios, { AxiosRequestConfig, Method } from 'axios';

export const requestPromiseHandler = (
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
  return axios(config);
};
