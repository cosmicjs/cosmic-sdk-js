import { PromiseFnType } from '../../../../types/promise.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindOneChaining extends Chaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, (res) => {
      onFulfilled?.({
        object: res.objects && res.objects.length ? res.objects[0] : null,
      });
    });
  }
}
