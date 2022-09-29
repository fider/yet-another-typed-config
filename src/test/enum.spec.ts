import { env } from '../app';
import { envFile, expectEnvError, expectOk, trimEachLine } from './test.util';
import { ModuleKind, transpileModule } from 'typescript';

enum ENum {
  one = 'the-one',
  two = 'the-two',
  three = 'the-three'
}

test('Required success', () => {
  envFile(`
    ENUM_ONE=the-one
    ENUM_TWO=the-two
  `);

  class EnvSchema {
    @env.enum(ENum)
    ENUM_ONE!: ENum;

    @env.enum(ENum)
    ENUM_TWO!: ENum;
  }

  const expected: EnvSchema = {
    ENUM_ONE: ENum.one,
    ENUM_TWO: ENum.two
  };
  
  expectOk(EnvSchema, expected);
});


test('Optional success', () => {
  envFile(`
    OPT_ENUM=the-one
    // OPT_ENUM__MISSING
    // OPT_ENUM__DEFAULT_ONE__MISSING
    OPT_ENUM__DEFAULT_ONE__OVERRIDED_TWO=the-two
  `);

  class EnvSchema {
    @env.optional.enum(ENum)
    OPT_ENUM: ENum | undefined;

    @env.optional.enum(ENum)
    OPT_ENUM__MISSING: ENum | undefined;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_ONE__MISSING: ENum = ENum.one;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_ONE__OVERRIDED_TWO: ENum = ENum.one;
  }

  const expected: EnvSchema = {
    OPT_ENUM: ENum.one,
    OPT_ENUM__MISSING: undefined,
    OPT_ENUM__DEFAULT_ONE__MISSING: ENum.one,
    OPT_ENUM__DEFAULT_ONE__OVERRIDED_TWO: ENum.two,
  };

  expectOk(EnvSchema, expected);
});

test('Errors', () => {
  envFile(`
    ENUM__ONE=the-one
    // ENUM__MISSING
    ENUM__BAD=bad
    OPT_ENUM__ONE=the-one
    // OPT_ENUM__MISSING
    OPT_ENUM__BAD=bad
    // OPT_ENUM__DEFAULT_ONE__MISSING
    OPT_ENUM__DEFAULT_ONE__OVERWRITED_BAD=bad
    // OPT_ENUM__DEFAULT_BAD__MISSING
    OPT_ENUM__DEFAULT_BAD__OVERWRITED_ONE=the-one
  `);

  class EnvSchema {
    @env.enum(ENum)
    ENUM__ONE!: ENum;

    @env.enum(ENum)
    ENUM__MISSING!: ENum;

    @env.enum(ENum)
    ENUM__BAD!: ENum;

    @env.optional.enum(ENum)
    OPT_ENUM__ONE: ENum | undefined;

    @env.optional.enum(ENum)
    OPT_ENUM__MISSING: ENum | undefined;
    
    @env.optional.enum(ENum)
    OPT_ENUM__BAD: ENum | undefined;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_ONE__MISSING: ENum = ENum.one;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_ONE__OVERWRITED_BAD: ENum = ENum.one;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_BAD__MISSING: ENum = 'bad-value' as ENum;

    @env.optional.enum(ENum)
    OPT_ENUM__DEFAULT_BAD__OVERWRITED_ONE: ENum = ENum.one;
  }

  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - ENUM__MISSING (Actual value=undefined): must be one of values ['the-one', 'the-two', 'the-three'].
    - ENUM__BAD (Actual value=\"bad\"): must be one of values ['the-one', 'the-two', 'the-three'].
    - OPT_ENUM__BAD (Actual value=\"bad\") is optional but if set then: must be one of values ['the-one', 'the-two', 'the-three'].
    - OPT_ENUM__DEFAULT_ONE__OVERWRITED_BAD (Actual value=\"bad\") is optional but if set then: must be one of values ['the-one', 'the-two', 'the-three'].
    - OPT_ENUM__DEFAULT_BAD__MISSING (Actual value=\"bad-value\"). It is optional but it defaults to invalid value=\"bad-value\" that should be changed by developer in ConfigSchema. For now you can just overwrite it by environment variable. Problem: must be one of values ['the-one', 'the-two', 'the-three'].`
  ));
});

test('Empty value enum', () => {
  envFile(`
    ENUM_FULL=full
    ENUM_EMPTY=
  `);

  enum EEmpty {
    full = 'full',
    empty = '',
  }

  class EnvSchema {
    @env.enum(EEmpty)
    ENUM_FULL!: EEmpty;

    @env.enum(EEmpty)
    ENUM_EMPTY!: EEmpty;
  }

  const expected: EnvSchema = {
    ENUM_FULL: EEmpty.full,
    ENUM_EMPTY: EEmpty.empty,
  };
  
  expectOk(EnvSchema, expected);
})

test('Key mappings success', () => {
  envFile(`
    NO_MAP=the-one
    A=the-one
    B=the-two
    OPT_C=the-three
  `);

  class EnvSchema {
    @env().enum(ENum)
    NO_MAP!: ENum;

    @env('B').enum(ENum)
    A!: ENum;

    @env('A').enum(ENum)
    B!: ENum;

    @env('NO_MAP').optional.enum(ENum)
    OPT__NO_MAP?: ENum;

    @env('OPT_C').optional.enum(ENum)
    OPT_C?: ENum;

    @env('OPT_C').optional.enum(ENum)
    OPT_C__DEFAULT_ONE: ENum = ENum.one;

    @env('OPT_MISSING').optional.enum(ENum)
    OPT__DEFAULT_TWO__MISSING: ENum = ENum.two;
  }

  const expected: EnvSchema = {
    NO_MAP: ENum.one,
    A: ENum.two,
    B: ENum.one,
    OPT__NO_MAP: ENum.one,
    OPT_C: ENum.three,
    OPT_C__DEFAULT_ONE: ENum.three,
    OPT__DEFAULT_TWO__MISSING: ENum.two,
  };
  
  expectOk(EnvSchema, expected);
});

test('Key mappings error messgae', () => {
  envFile(`
  `);

  class EnvSchema {
    @env().enum(ENum)
    NO_MAP!: ENum;

    @env('B').enum(ENum)
    A!: ENum;
  }
  
  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - NO_MAP (Actual value=undefined): must be one of values ['the-one', 'the-two', 'the-three'].
    - B mapped to config.A (Actual value=undefined): must be one of values ['the-one', 'the-two', 'the-three'].`
  ));
});
