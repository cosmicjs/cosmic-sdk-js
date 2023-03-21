import HTTP_METHODS from '../constants/httpMethods.constants';
import { requestPromiseHandler } from './request.promise.handler';

export const promiser = (endpoint: string) =>
  new Promise((resolve, reject) => {
    requestPromiseHandler(HTTP_METHODS.GET, endpoint)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err.response ? err.response.data : err.response));
  });
