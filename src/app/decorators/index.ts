import { booleanDecorator } from "./boolean"
import { enumDecorator } from "./enum";
import { Float, floatDecorator } from "./float";
import { Int, intDecorator, NumberOpts } from "./int";
import { stringDecorator, StringOpts } from "./string";

/**
 * By default each env is required
 */
const env = function(envKeyName?: string) {
  return {
    boolean(): RequiredDecorator<boolean> {
      return booleanDecorator({ envKeyName, isOptional: false });
    },
    int(opts?: NumberOpts): RequiredDecorator<Int> {
      return intDecorator({ ...opts, envKeyName, isOptional: false });
    },
    float(opts?: NumberOpts): RequiredDecorator<Float> {
      return floatDecorator({ ...opts, envKeyName, isOptional: false });
    },
    string(opts?: StringOpts): RequiredDecorator<string> {
      return stringDecorator({ ...opts, envKeyName, isOptional: false });
    },

    /**
     * **!!** Use only enums with string keys/values, eg below is ok:
     * 
     * ```
     * enum En {
     *  one = '1' // string value
     * }
     * ```
     * 
     * And below is not ok. Why? Because below enum will validate successfully both: keys and values (`"one"` and `1`)
     * ```
     * enum En {
     *  one = 1 // non string value
     * }
     * ```
     */
    enum<TEnum extends Record<string, string>>(theEnum: TEnum): RequiredDecorator<TEnum[keyof TEnum]> {
      return enumDecorator(theEnum, { envKeyName, isOptional: false });
    },
    
    optional: {
      boolean(): OptionalDecorator<boolean> {
        return booleanDecorator({ envKeyName, isOptional: true }) as OptionalDecorator<boolean>;
      },
      int(opts?: NumberOpts): OptionalDecorator<Int> {
        return intDecorator({ ...opts, envKeyName, isOptional: true }) as OptionalDecorator<Int>;
      },
      float(opts?: NumberOpts): OptionalDecorator<Float> {
        return floatDecorator({ ...opts, envKeyName, isOptional: true }) as OptionalDecorator<Float>;
      },
      string(opts?: StringOpts): OptionalDecorator<string> {
        return stringDecorator({ ...opts, envKeyName, isOptional: true }) as OptionalDecorator<string>;
      },


      /**
       * **!!** Use only enums with string keys/values, eg below is ok:
       * 
       * ```
       * enum En {
       *  one = '1' // string value
       * }
       * ```
       * 
       * Why? Because TypeScript. Because below enum will validate successfully both: keys and values (`"one"` and `1`)
       * ```
       * enum En {
       *  one = 1 // non string value
       * }
       * ```
       */
      enum<TEnum extends Record<string, string>>(theEnum: TEnum): OptionalDecorator<TEnum[keyof TEnum]> {
        return enumDecorator(theEnum, { envKeyName, isOptional: true }) as OptionalDecorator<TEnum[keyof TEnum]>;
      },
    }
  }
}

env.boolean = env().boolean;
env.int = env().int;
env.float = env().float;
env.string = env().string;
env.enum = env().enum;
env.optional = env().optional;


export type { Int, Float };
export { env };
env.enum