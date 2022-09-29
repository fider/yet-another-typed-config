
type RequiredDecorator<TValue> = <T extends Record<K, TValue>, K extends string>(target: T, key: K) => void;
type OptionalDecorator<TValue> = <T extends {[KK in K]?: TValue }, K extends string>(target: T, key: K) => void;
type TypedDecorator<TValue> = <T extends Record<K, TValue>, K extends string>(target: T, key: K) => void;

type DecoratorOpts<T> = T & {
  isOptional: boolean;
  envKeyName?: string;
}

type IfEnvCondition =
  string
  |
  { and: string[] }
  |
  { or: string[] }
;

type IfConfigCondition<T extends Record<string, any>> =
  keyof T
  |
  { and: Array<keyof T> }
  |
  { or: Array<keyof T> }
;


type Conditional<T extends Record<string, any>> = {
  ifEnvDefined?: IfEnvCondition;
  ifEnvNotDefined?: IfEnvCondition;
  ifConfigDefined?: IfConfigCondition<T>;
  ifConfigNotDefined?: IfConfigCondition<T>;
}
