import { IsNumber, Max, Min } from "class-validator";
import { transformNumericStringProperty } from "../helpers/helper";
import { setPropertyMapping } from "../helpers/property-mapping";
import { NumberOpts } from "./int";
import { optionalDecorator } from "./optional";

// ========================================================
//  Float
//
/**
 * `_fake_float` is for you - developer, so your IDE will show you appropriate hint (is it Int or Float). In fact this property not exists.
 * 
 * (can be reason of compilation error when TypeScript will finally handle strict Exact types. If such then replace `@float` with `@string({ match: /^\d+\.\d*$/ })` until fixed by me)
 */
 export type Float = number & {
  _fake_float: symbol;
}
export function floatDecorator(opts: DecoratorOpts<NumberOpts>) {
  return function FloatDecorator<T extends Record<K, Float>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    transformNumericStringProperty({ csvSeparator: ',' }, target, key);
    

    IsNumber({}, { 
      message: `should be number (int and float accepted. Float separator is '.')`,
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
