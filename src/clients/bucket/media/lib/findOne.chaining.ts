import { promiser } from '../../../../utils/request.promiser';
import MethodChaining from '../../lib/methodChaining';

export default class FindOneChaining extends MethodChaining {
  async then(resolve: any, reject: any) {
    promiser(this.endpoint)
      .then((res: any) =>
        resolve(
          {
            media: res.media && res.media.length ? res.media[0] : null,
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
