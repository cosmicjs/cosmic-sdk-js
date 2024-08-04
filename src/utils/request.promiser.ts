import HTTP_METHODS from '../constants/httpMethods.constants';
import { PromiseFnType } from '../types/promise.types';
import { requestHandler } from './request.handler';

export const promiserTryCatchWrapper = async (
  endpoint: string,
  onRejected: PromiseFnType<any> | undefined,
  cb: (result: any) => void
) => {
  try {
    const result = await requestHandler(HTTP_METHODS.GET, endpoint);
    cb(result);
  } catch (err) {
    if (onRejected && typeof onRejected === 'function') {
      onRejected(err);
    } else {
      throw err;
    }
  }
};
