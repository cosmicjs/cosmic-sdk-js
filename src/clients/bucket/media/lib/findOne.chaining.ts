import { PromiseFnType } from '../../../../types/promise.types';
import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining extends MethodChaining {
  async then<FulfilledResult = any, RejectedResult = never>(
    onFulfilled?: PromiseFnType<FulfilledResult>,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    try {
      const result: any = await promiser(this.endpoint);
      const media =
        result.media && result.media.length ? result.media[0] : null;
      onFulfilled?.({ media });
    } catch (err) {
      onRejected?.(err);
      throw err;
    }
  }
}
