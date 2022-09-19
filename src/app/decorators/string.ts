import { IsNotEmpty, IsString, Matches } from "class-validator";
import { transformStringProperty } from "../helpers/helper";
import { setPropertyMapping } from "../helpers/property-mapping";
import { optionalDecorator } from "./optional";

// ========================================================
//  String
//
export type StringOpts = {
  /**
   * Full match: `/^someText$/`
   * 
   * Partial match: `/someText/`
   * 
   * `Default: match any string`
   */
  match?: RegExp;
}

export function stringDecorator(opts: DecoratorOpts<StringOpts>) {
  return function StringDecorator<T extends Record<K, string>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    transformStringProperty({ csvSeparator: ',' }, target, key);

    IsString({ 
      message: `must be string`,
    })(target, key);

    if (!opts.isOptional) {
      IsNotEmpty({
        message: `must be non-empty string`
      })(target, key);
    }

    if (opts.match != undefined) {
      Matches(opts.match, {
        message: `must match ${opts.match} regular expression`,
      })(target, key);
    }
  };
}
