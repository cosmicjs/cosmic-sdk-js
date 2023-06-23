import { PromiseFnType } from '../../../../types/promise.types';
import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining extends MethodChaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    promiser(this.endpoint)
      .then((res: any) =>
        onFulfilled?.({
          media: res.media && res.media.length ? res.media[0] : null,
        })
      )
      .catch((err) => {
        if (typeof onRejected === 'function') {
          onRejected?.(err);
        } else {
          onFulfilled?.(null);
        }
      });
  }
}
