import { PromiseFnType } from '../../../../types/promise.types';
import { promiser } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindOneChaining extends Chaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    promiser(this.endpoint)
      .then((res: any) =>
        onFulfilled?.({
          object: res.objects && res.objects.length ? res.objects[0] : null,
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
