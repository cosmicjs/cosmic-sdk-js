import { PromiseFnType } from '../../../../types/promise.types';
import { RevisionsResponse } from '../../../../types/object.types';
import { promiserTryCatchWrapper } from '../../../../utils/request.promiser';
import Chaining from './chaining';
import { addFullMediaData } from '../../../../utils/addFullMedia';
import { BucketConfig } from '../../../../types/config.types';
import { createBucketClient } from '../..';

export default class FindChaining<T = any> extends Chaining {
  private bucketConfig: BucketConfig;

  constructor(endpoint: string, bucketConfig: BucketConfig) {
    super(endpoint);
    this.bucketConfig = bucketConfig;
  }

  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

  async then<FulfilledResult = RevisionsResponse<T>, RejectedResult = never>(
    onFulfilled?:
      | ((
          value: RevisionsResponse<T>
        ) => FulfilledResult | PromiseLike<FulfilledResult>)
      | null,
    onRejected?: PromiseFnType<RejectedResult>
  ) {
    await promiserTryCatchWrapper(this.endpoint, onRejected, async (res) => {
      // eslint-disable-next-line no-underscore-dangle
      if (this.opts && this.opts.media && res.revisions) {
        res.revisions = await addFullMediaData(
          res.revisions,
          createBucketClient(this.bucketConfig),
          this.opts.media.props
        );
      }
      onFulfilled?.(res);
    });
  }
}
