import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindChaining extends MethodChaining {
  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

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
      .then((res) => onFulfilled?.(res))
      .catch((err) => {
        if (typeof onRejected === 'function') {
          onRejected?.(err);
        } else {
          onFulfilled?.(null);
        }
      });
  }
}
