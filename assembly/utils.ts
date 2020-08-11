export class Box<T> {
  private readonly _v: T

  constructor(v: T) {
    this._v = v;
  }

  get v(): T { return this._v; }
}
