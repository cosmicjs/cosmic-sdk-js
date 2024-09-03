import MethodChaining from '../../lib/methodChaining';

/**
 * Options for fetching object data.
 * 'full_media_data': Retrieves full media data for media objects, including additional metadata and URLs.
 */
type OptionsType = 'full_media_data';
export default class Chaining extends MethodChaining {
  depth(depth: number) {
    this.endpoint += `&depth=${depth}`;
    return this;
  }

  status(status: string) {
    this.endpoint += `&status=${status}`;
    return this;
  }

  after(after: string) {
    this.endpoint += `&after=${after}`;
    return this;
  }

  options(options: OptionsType) {
    if (options.includes('full_media_data')) {
      // eslint-disable-next-line no-underscore-dangle
      this._options = 'full_media_data';
    }
    return this;
  }
}
