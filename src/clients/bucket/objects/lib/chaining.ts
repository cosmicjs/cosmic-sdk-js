import MethodChaining from '../../lib/methodChaining';

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
}
