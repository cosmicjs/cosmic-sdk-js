import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindChaining extends MethodChaining {
  limit(limit: number) {
    this.endpoint += `&limit=${limit}`;
    return this;
  }

  async then(resolve: any, reject: any) {
    promiser(this.endpoint)
      .then((res) => resolve(res, null))
      .catch((err) => {
        if (typeof reject === 'function') {
          reject(err);
        } else {
          resolve(null, err);
        }
      });
  }
}
