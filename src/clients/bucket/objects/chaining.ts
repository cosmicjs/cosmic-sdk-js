export default class Chaining {
  endpoint: string = '';

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  props(props: string | Array<string>) {
    let propStr = props;
    if (Array.isArray(propStr)) {
      propStr = propStr
        .filter((prop) => typeof prop === 'string')
        .map((prop) => prop.trim())
        .filter((prop) => !!prop)
        .toString();
    }
    this.endpoint += `&props=${propStr}`;
    return this;
  }

  depth(depth: number) {
    this.endpoint += `&depth=${depth}`;
    return this;
  }

  sort(sort: string) {
    this.endpoint += `&sort=${sort}`;
    return this;
  }

  skip(skip: number) {
    this.endpoint += `&skip=${skip}`;
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

  useCache() {
    this.endpoint += `&use_cache=true`;
    return this;
  }
}
