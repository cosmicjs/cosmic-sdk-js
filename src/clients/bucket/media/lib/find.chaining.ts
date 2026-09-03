import { PromiseFnType } from '../../../../types/promise.types';
import { MediaListResponse } from '../../../../types/object.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindChaining<T = any> extends MethodChaining {
  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

  async then<FulfilledResult = MediaListResponse<T>, RejectedResult = never>(
    onFulfilled?:
      | ((
          value: MediaListResponse<T>
        ) => FulfilledResult | PromiseLike<FulfilledResult>)
      | null,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, (result) =>
      onFulfilled?.(result)
    );
  }
}
