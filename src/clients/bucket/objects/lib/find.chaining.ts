import { promiser } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindChaining extends Chaining {
  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?:
      | ((value: any) => FulfilledResult | PromiseLike<FulfilledResult>)
      | null,
    onRejected?:
      | ((value: any) => RejectedResult | PromiseLike<RejectedResult>)
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
