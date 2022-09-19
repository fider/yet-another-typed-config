
type RequiredDecorator<TValue> = <T extends Record<K, TValue>, K extends string>(target: T, key: K) => void;
type OptionalDecorator<TValue> = <T extends {[KK in K]?: TValue }, K extends string>(target: T, key: K) => void;
type TypedDecorator<TValue> = <T extends Record<K, TValue>, K extends string>(target: T, key: K) => void;

type DecoratorOpts<T> = T & {
  isOptional: boolean;
  envKeyName?: string;
}
