import { IsEnum } from "class-validator";

import { transformEnumProperty } from "../helpers/helper";
import { setPropertyMapping } from "../helpers/property-mapping";
import { optionalDecorator } from "./optional";

// ========================================================
//  enum
//
export function enumDecorator<TEnum extends Record<string, string>>(theEnum: TEnum, opts: DecoratorOpts<{}>) {
  return function EnumValuesDecorator<T extends Record<K, TEnum[keyof TEnum]>, K extends string>(target: T, key: K) {
    setPropertyMapping({ classPrototype: target, envKeyName: opts.envKeyName ?? key, configPropertyName: key });

    if (opts.isOptional) {
      optionalDecorator(target, key);
    }

    transformEnumProperty({ csvSeparator: ',' }, target, key);

    IsEnum(theEnum, {
      message: `must be one of values ['${Object.values(theEnum).join(`', '`)}']`,
    })(target, key);
  } as TypedDecorator<TEnum[keyof TEnum]>;
}
