import HTTP_METHODS from '../constants/httpMethods.constants';
import { PromiseFnType } from '../types/promise.types';
import { requestPromiseHandler } from './request.promise.handler';

export const promiser = (endpoint: string) =>
  new Promise((resolve, reject) => {
    requestPromiseHandler(HTTP_METHODS.GET, endpoint)
      .then((response) => resolve(response.data))
      .catch((err) => reject(err.response ? err.response.data : err.response));
  });

export const promiserTryCatchWrapper = async (
  endpoint: string,
  onRejected: PromiseFnType<any> | undefined,
  cb: (result: any) => void
) => {
  try {
    const result: any = await promiser(endpoint);
    cb(result);
  } catch (err) {
    if (onRejected && typeof onRejected === 'function') {
      onRejected(err);
    } else {
      throw err;
    }
  }
};
