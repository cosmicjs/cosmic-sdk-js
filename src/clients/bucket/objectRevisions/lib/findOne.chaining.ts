import { PromiseFnType } from '../../../../types/promise.types';
import { RevisionResponse } from '../../../../types/object.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import Chaining from './chaining';
import { addFullMediaData } from '../../../../utils/addFullMedia';
import { BucketConfig } from '../../../../types/config.types';
import { createBucketClient } from '../..';

export default class FindOneChaining<T = any> extends Chaining {
  private bucketConfig: BucketConfig;

  constructor(endpoint: string, bucketConfig: BucketConfig) {
    super(endpoint);
    this.bucketConfig = bucketConfig;
  }

  async then<FulfilledResult = RevisionResponse<T>, RejectedResult = never>(
    onFulfilled?:
      | ((
          value: RevisionResponse<T>
        ) => FulfilledResult | PromiseLike<FulfilledResult>)
      | null,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, async (res) => {
      let { revision } = res;
      if (this.opts && this.opts.media && revision) {
        revision = await addFullMediaData(
          revision,
          createBucketClient(this.bucketConfig),
          this.opts.media.props
        );
      }

      onFulfilled?.({ revision });
    });
  }
}
