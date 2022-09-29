import { env, Int } from '../app';
import { envFile, trimEachLine, expectEnvError, expectOk } from './test.util';

test('Required success', () => {
  envFile(`
    INT_A=-243
    INT_B=0
    INT_C=664
  `);

  class EnvSchema {
    @env.int()
    INT_A!: Int;

    @env.int()
    INT_B!: Int;

    @env.int()
    INT_C!: Int;
  }

  const expected: EnvSchema = {
    INT_A: -243 as Int,
    INT_B: 0 as Int,
    INT_C: 664 as Int,
  };
  
  expectOk(EnvSchema, expected);
});


test('Optional success', () => {
  envFile(`
    OPT_INT__10=10
    // OPT_INT__MISSING
    OPT_INT__DEFAULT_20__OVERRIDED_0=0
    // OPT_INT__DEFAULT_N5__MISSING
  `);

  class EnvSchema {
    @env.optional.int()
    OPT_INT__10: Int | undefined;

    @env.optional.int()
    OPT_INT__MISSING: Int | undefined;

    @env.optional.int()
    OPT_INT__DEFAULT_20__OVERRIDED_0: Int = 20 as Int;

    @env.optional.int()
    OPT_INT__DEFAULT_N5__MISSING: Int = -5 as Int;

  }

  const expected: EnvSchema = {
    OPT_INT__10: 10 as Int,
    OPT_INT__MISSING: undefined,
    OPT_INT__DEFAULT_20__OVERRIDED_0:0 as Int,
    OPT_INT__DEFAULT_N5__MISSING: -5 as Int,
  };

  expectOk(EnvSchema, expected);
});

test('Errors & invalid default value', () => {
  envFile(`
    INT_9=9
    INT__FLOAT=9.0001
    // INT__MISSING
    OPT_INT__8=8
    // OPT_INT__MISSING
    OPT_INT__FLOAT=2.31
    OPT_INT__DEFAULT_INT__OVERRIDED_FLOAT=99.1
    OPT_INT__DEFAULT_5__OVERRIDED_15=15
    OPT_INT__DEFAULT_26__OVERRIDED_16=16
    OPT_INT__DEFAULT_15__OVERRIDED_5=5
    OPT_INT__DEFAULT_16__OVERRIDED_26=26
    // OPT_INT__BAD_DEFAULT__MISSING
  `);

  class EnvSchema {
    @env.int()
    INT_9!: Int;
    
    @env.int()
    INT__FLOAT!: Int;

    @env.int()
    INT__MISSING!: Int;

    @env.optional.int()
    OPT_INT__8: Int | undefined;

    @env.optional.int()
    OPT_INT__MISSING: Int | undefined;
    
    @env.optional.int()
    OPT_INT__FLOAT: Int | undefined;

    @env.optional.int()
    OPT_INT__DEFAULT_INT__OVERRIDED_FLOAT: Int = 11 as Int;

    // min/max ok
    @env.optional.int({ min: 10, max: 20 })
    OPT_INT__DEFAULT_5__OVERRIDED_15: Int = 5 as Int;

    // min/max ok
    @env.optional.int({ min: 10, max: 20 })
    OPT_INT__DEFAULT_26__OVERRIDED_16: Int = 26 as Int;

    // min err
    @env.optional.int({ min: 10, max: 20 })
    OPT_INT__DEFAULT_15__OVERRIDED_5: Int = 15 as Int;

    // max err
    @env.optional.int({ min: 10, max: 20 })
    OPT_INT__DEFAULT_16__OVERRIDED_26: Int = 16 as Int;

    @env.optional.int({ min: 2})
    OPT_INT__BAD_DEFAULT__MISSING: Int = 1 as Int;
  }

  expectEnvError(
    EnvSchema, trimEachLine(`Invalid environment variables provided:
      - INT__FLOAT (Actual value=9.0001): should be integer.
      - INT__MISSING (Actual value=undefined): should be integer.
      - OPT_INT__FLOAT (Actual value=2.31) is optional but if set then: should be integer.
      - OPT_INT__DEFAULT_INT__OVERRIDED_FLOAT (Actual value=99.1) is optional but if set then: should be integer.
      - OPT_INT__DEFAULT_15__OVERRIDED_5 (Actual value=5) is optional but if set then: must not be lower than 10.
      - OPT_INT__DEFAULT_16__OVERRIDED_26 (Actual value=26) is optional but if set then: must not be greater than 20.
      - OPT_INT__BAD_DEFAULT__MISSING (Actual value=1). It is optional but it defaults to invalid value=1 that should be changed by developer in ConfigSchema. For now you can just overwrite it by environment variable. Problem: must not be lower than 2.
    `)
  );
});

test('Key mappings success', () => {
  envFile(`
    NO_MAP=0
    A=1
    B=2
    OPT_B=22
  `);

  class EnvSchema {
    @env().int()
    NO_MAP!: Int;

    @env('B').int()
    A!: Int;

    @env('A').int()
    B!: Int;

    @env('NO_MAP').optional.int()
    OPT__NO_MAP?: Int;

    @env('OPT_B').optional.int()
    OPT_B?: Int;

    @env('OPT_B').optional.int()
    OPT_B__DEFAULT_3: Int = 3 as Int;

    @env('OPT_MISSING').optional.int()
    OPT__DEFAULT_3__MISSING: Int = 3 as Int;
  }

  const expected: EnvSchema = {
    NO_MAP: 0 as Int,
    A: 2 as Int,
    B: 1 as Int,
    OPT__NO_MAP: 0 as Int,
    OPT_B: 22 as Int,
    OPT_B__DEFAULT_3: 22 as Int,
    OPT__DEFAULT_3__MISSING: 3 as Int,
  };
  
  expectOk(EnvSchema, expected);
});

test('Key mappings error messgae', () => {
  envFile(`
  `);

  class EnvSchema {
    @env().int()
    NO_MAP!: Int;

    @env('B').int()
    A!: Int;
  }
  
  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - NO_MAP (Actual value=undefined): should be integer.
    - B mapped to config.A (Actual value=undefined): should be integer.`
  ));
});
