import MethodChaining from '../../lib/methodChaining';

/**
 * Options for fetching object data.
 * @property {Object} media - Options for media objects.
 * @property {string} media.props - Comma-separated list of additional properties to fetch for media objects.
 * @typedef {Object} MediaType
 * @property {string} all - All media properties.
 * @property {string} id - The unique identifier of the media object.
 * @property {string} name - The name of the media file.
 * @property {string} original_name - The original name of the media file.
 * @property {number} size - The size of the media file in bytes.
 * @property {string} type - The MIME type of the media file.
 * @property {string} bucket - The bucket identifier.
 * @property {string} created_at - The creation date of the media object.
 * @property {string} folder - The folder where the media is stored.
 * @property {string} url - The URL of the media file.
 * @property {string} imgix_url - The Imgix URL of the media file.
 * @property {string} alt_text - The alternative text for the media.
 */
type OptionsType = {
  media: {
    props: string;
  };
};
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
    if (options) {
      this.opts = options;
    }
    return this;
  }
}
