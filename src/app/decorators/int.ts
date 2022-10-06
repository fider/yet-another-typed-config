import { IsInt, Max, Min } from "class-validator";
import { transformNumericStringProperty } from "../helpers/helper";
import { setPropertyMapping } from "../helpers/property-mapping";
import { optionalDecorator } from "./optional";

// ========================================================
//  Int
//
/**
 * `_fake_int` is for you - developer, so your IDE will show you appropriate hint (is it Int or Float). In fact this property not exists.
 * 
* (can be reason of compilation error when TypeScript will finally handle strict Exact types. If such then replace `@int` with `@string({ match: /^\d+$/ })` until fixed by me)
 */
export type Int = number & {
  _fake_int?: symbol;
}

export type NumberOpts = {
  /**
   * Integer value
   */
  max?: number;

  /**
   * Integer value
   */
  min?: number;
}

export function intDecorator(opts: DecoratorOpts<NumberOpts>) {
  return function IntDecorator<T extends Record<K, Int>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    transformNumericStringProperty({ csvSeparator: ',' }, target, key);

    IsInt({
      message: `should be integer`,
    })(target, key);

    if (opts.max != undefined) {
      Max(opts.max, {
        message: `must not be greater than ${opts.max}`,
      })(target, key);
    }

    if (opts.min != undefined) {
      Min(opts.min, {
        message: `must not be lower than ${opts.min}`,
      })(target, key);
    }
  };
}
