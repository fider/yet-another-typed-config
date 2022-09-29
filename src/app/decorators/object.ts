import { ValidateNested } from "class-validator";
import { setPropertyMapping } from "../helpers/property-mapping";
import { optionalDecorator } from "./optional";

export function objectDecorator<TObj extends Record<string, boolean | number | string>>(theClass: new () => TObj, opts: DecoratorOpts<{}>) {
  return function ObjectDecorator<T extends Record<K, TObj>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    ValidateNested({
      message: `must be object of class "${theClass.constructor.name}"`,
    })(target, key);
  } as TypedDecorator<TObj[keyof TObj]>;
}
