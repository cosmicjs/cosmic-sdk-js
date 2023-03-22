import { promiser } from '../../../../utils/request.promiser';
import Chaining from './chaining';

export default class FindOneChaining extends Chaining {
  async then(resolve: any, reject: any) {
    promiser(this.endpoint)
      .then((res: any) =>
        resolve(
          {
            object: res.objects && res.objects.length ? res.objects[0] : null,
          },
          null
        )
      )
      .catch((err) => {
        if (typeof reject === 'function') {
          reject(err);
        } else {
          resolve(null, err);
        }
      });
  }
}
