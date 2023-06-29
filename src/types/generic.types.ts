export type GenericObject = Record<string, any>;
export type NonEmptyObject<T extends Record<string, unknown>> =
  T extends Record<string, never> ? never : T;
