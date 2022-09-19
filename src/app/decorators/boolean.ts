import { IsBoolean } from "class-validator";
import { transformBooleanProperty } from "../helpers/helper";
import { setPropertyMapping } from "../helpers/property-mapping";
import { optionalDecorator } from "./optional";

// ========================================================
//  Boolean
//
export function booleanDecorator(opts: DecoratorOpts<{}>) {
  return function BooleanDecorator<T extends Record<K, boolean>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    transformBooleanProperty({ csvSeparator: ',' }, target, key);

    IsBoolean({
      message: `must be one of accepted boolean values=[true, false, 1, 0]`,
    })(target, key);
  };
}
