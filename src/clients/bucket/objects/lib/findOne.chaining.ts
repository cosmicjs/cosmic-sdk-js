import { promiser } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindOneChaining extends Chaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?:
      | ((value: any) => FulfilledResult | PromiseLike<FulfilledResult>)
      | undefined
      | null,
    onRejected?:
      | ((value: any) => RejectedResult | PromiseLike<RejectedResult>)
      | undefined
      | null
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
