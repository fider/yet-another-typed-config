import 'reflect-metadata';
import { Transform } from 'class-transformer';

const META_PREFIX = 'library:yet-another-typed-config';

const METADATA__MAP_OF_IS_PROPERTY_OPTIONAL = Symbol(`${META_PREFIX}:is-property-optional`);
type MetaData = Record<string, true>;
//
// ========================================================
//  Optionals
//
export function markPropertyAsOptional<T extends object>(targetPrototype: T, key: string) {
  const meta: MetaData = Reflect.getMetadata(
    METADATA__MAP_OF_IS_PROPERTY_OPTIONAL,
    targetPrototype.constructor
  ) ?? {};

  meta[key as any] = true;
  
  Reflect.defineMetadata(
    METADATA__MAP_OF_IS_PROPERTY_OPTIONAL,
    meta,
    targetPrototype.constructor
  );
}

export function isPropertyMarkedAsOptional<T extends object>(targetPrototype: T, key: string): boolean {
  const meta: MetaData | undefined = Reflect.getMetadata(
    METADATA__MAP_OF_IS_PROPERTY_OPTIONAL,
    targetPrototype.constructor
  );

  return (meta ?? {})[key as any] === true;
}
//
// ========================================================
//  Transform parsed values - they are conditional to not obfuscate error message
//
export function transformNumericStringProperty(opts: { isArray?: boolean; csvSeparator: string }, target: object, key: string) {
  Transform(({ value }: { value: string | undefined }) => {
    if (opts.isArray && value != undefined) {
      const valueList: Array<string | number> = splitString(value, { separator: opts.csvSeparator }).map(mapParsedNumber) as Array<string | number>;
      return valueList;
    } else {
      return mapParsedNumber(value);
    }

    
  }, { toClassOnly: true })(target, key);
}
function mapParsedNumber(value: string | undefined) {
  const numberValue = +(value as string);
  if (
    value !== '' &&
    typeof numberValue === 'number' &&
    Number.isFinite(numberValue) &&
    !Number.isNaN(numberValue)
  ) {
    return numberValue;
  }
  return value;
}

export function transformBooleanProperty(opts: { isArray?: boolean; csvSeparator: string }, target: object, key: string) {
  Transform(({ value }: { value: string | undefined }) => {
    if (
      opts.isArray &&
      value != undefined &&
      !Array.isArray(value) // if default value is set then it is already JS Array
    ) {
      const valueList: Array<string | boolean> = splitString(value, { separator: opts.csvSeparator }).map(mapParsedBoolean) as Array<string | boolean>;
      return valueList;
    } else {
      return mapParsedBoolean(value);
    }

  }, { toClassOnly: true })(target, key);
}

function mapParsedBoolean(value: string | undefined) {
  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }
  
  return value;
}

export function transformStringProperty(opts: { isArray?: boolean; csvSeparator: string }, target: object, key: string) {
  Transform(({ value }: { value: string | undefined }) => {
    if (
      opts.isArray &&
      value != undefined && 
      !Array.isArray(value) // if default value is set then it is already JS Array
    ) {
      const valueList: string[] = splitStringWithEscape(value, { separator: opts.csvSeparator }).map(mapParsedString) as string[];
      return valueList;
    } else {
      return mapParsedString(value);
    }
  }, { toClassOnly: true })(target, key);
}
function mapParsedString(value: string | undefined) {
  return value;
}

export function transformEnumProperty(opts: { isArray?: boolean; csvSeparator: string }, target: object, key: string) {
  Transform(({ value }: { value: string | undefined }) => {
    if (
      opts.isArray &&
      value != undefined &&
      !Array.isArray(value) // if default value is set then it is already JS Array
    ) {
      const valueList: string[] = splitString(value, { separator: opts.csvSeparator }).map(mapParsedString) as string[];
      return valueList;
    } else {
      return mapParsedString(value);
    }
  }, { toClassOnly: true })(target, key);
}

function unescapeSeparator(str: string) {
  return str.replace('\\,', ',')
}

function splitStringWithEscape(str: string, opts: { separator: string }): string[] {
  // TODO improve to handle custom escape character
  return str.split(/(?<!\\),/).map(unescapeSeparator);
}

function splitString(str: string, opts: { separator: string }): string[] {
  return str.split(opts.separator);
}
