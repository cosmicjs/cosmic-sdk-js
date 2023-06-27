import { PromiseFnType } from '../../../../types/promise.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining extends MethodChaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, (result) => {
      const media =
        result.media && result.media.length ? result.media[0] : null;
      onFulfilled?.({ media });
    });
  }
}
