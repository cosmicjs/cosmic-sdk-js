import { PromiseFnType } from '../../../../types/promise.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindChaining extends Chaining {
  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, (res) =>
      onFulfilled?.(res)
    );
  }
}
