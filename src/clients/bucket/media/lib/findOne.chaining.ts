import { PromiseFnType } from '../../../../types/promise.types';
import { MediaResponse } from '../../../../types/object.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining<T = any> extends MethodChaining {
  async then<FulfilledResult = MediaResponse<T>, RejectedResult = never>(
    onFulfilled?:
      | ((
          value: MediaResponse<T>
        ) => FulfilledResult | PromiseLike<FulfilledResult>)
      | null,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, (result) => {
      const media =
        result.media && result.media.length ? result.media[0] : null;
      onFulfilled?.({ media });
    });
  }
}
