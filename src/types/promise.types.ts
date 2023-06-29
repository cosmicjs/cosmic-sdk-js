type PromiseFn<T> = (value: any) => T | PromiseLike<T>;

export type PromiseFnType<T> = PromiseFn<T> | null;
