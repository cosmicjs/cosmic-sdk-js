import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining extends MethodChaining {
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
