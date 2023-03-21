import HTTP_METHODS from '../constants/httpMethods.constants';
import { requestHandler } from './request.handler';

export const promiser = (endpoint: string) =>
  new Promise((resolve, reject) => {
    requestHandler(HTTP_METHODS.GET, endpoint)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err.response ? err.response.data : err.response));
  });
