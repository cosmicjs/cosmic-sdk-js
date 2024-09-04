export default class MethodChaining {
  endpoint: string = '';

  opts: any;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  props(props: string | Array<string>) {
    let propStr: string;

    if (typeof props === 'string') {
      propStr =
        props.startsWith('{') && props.endsWith('}')
          ? this.parseGraphQLProps(props.slice(1, -1))
          : props;
    } else if (Array.isArray(props)) {
      propStr = props
        .filter((prop): prop is string => typeof prop === 'string')
        .map((prop) => prop.trim())
        .filter(Boolean)
        .join(',');
    } else {
      throw new Error('Invalid props type');
    }
    this.endpoint += `&props=${encodeURIComponent(propStr)}`;
    return this;
  }

  private parseGraphQLProps(propsString: string): string {
    const lines = propsString
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const result: string[] = [];
    const currentPath: string[] = [];

    for (const line of lines) {
      if (line.includes('{')) {
        const [key] = line.split('{');
        if (key !== undefined) {
          currentPath.push(key.trim());
        }
      } else if (line === '}') {
        currentPath.pop();
      } else {
        result.push([...currentPath, line].join('.'));
      }
    }

    return result.join(',');
  }

  sort(sort: string) {
    this.endpoint += `&sort=${sort}`;
    return this;
  }

  skip(skip: number) {
    this.endpoint += `&skip=${skip}`;
    return this;
  }

  useCache() {
    this.endpoint += `&use_cache=true`;
    return this;
  }
}
