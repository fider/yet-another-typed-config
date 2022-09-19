import { env, Float } from '../app';
import { envFile, trimEachLine, expectEnvError, expectOk } from './test.util';

test('Required success', () => {
  envFile(`
    FLOAT_A=-243.31
    FLOAT_B=0.0
    FLOAT_C=664.0001
    FLOAT__INT=4
  `);

  class EnvSchema {
    @env.float()
    FLOAT_A!: Float;

    @env.float()
    FLOAT_B!: Float;

    @env.float()
    FLOAT_C!: Float;
    
    @env.float()
    FLOAT__INT!: Float;
  }

  const expected: EnvSchema = {
    FLOAT_A: -243.31 as Float,
    FLOAT_B: 0 as Float,
    FLOAT_C: 664.0001 as Float,
    FLOAT__INT: 4 as Float,
  };
  
  expectOk(EnvSchema, expected);
});


test('Optional success', () => {
  envFile(`
    OPT_FLOAT=10.01
    // OPT_FLOAT__MISSING
    OPT_FLOAT__DEFAULT_20p1__OVERRIDED_0=0
    // OPT_FLOAT__DEFAULT_n5p1__MISSING
  `);

  class EnvSchema {
    @env.optional.float()
    OPT_FLOAT: Float | undefined;

    @env.optional.float()
    OPT_FLOAT__MISSING: Float | undefined;

    @env.optional.float()
    OPT_FLOAT__DEFAULT_20p1__OVERRIDED_0: Float = 20.1 as Float;

    @env.optional.float()
    OPT_FLOAT__DEFAULT_n5p1__MISSING: Float = -5.1 as Float;

  }

  const expected: EnvSchema = {
    OPT_FLOAT: 10.01 as Float,
    OPT_FLOAT__MISSING: undefined,
    OPT_FLOAT__DEFAULT_20p1__OVERRIDED_0: 0 as Float,
    OPT_FLOAT__DEFAULT_n5p1__MISSING: -5.1 as Float,
  };

  expectOk(EnvSchema, expected);
});

test('Errors & invalid default value', () => {
  envFile(`
    FLOAT_9p1=9.1
    FLOAT__INT=9
    // FLOAT__MISSING
    OPT_FLOAT__8=8
    // OPT_FLOAT__MISSING
    OPT_FLOAT__DEFAULT_5p1__OVERRIDED_15p1=15.1
    OPT_FLOAT__DEFAULT_26p1__OVERRIDED_16p1=16.1
    OPT_FLOAT__DEFAULT_15p1__OVERRIDED_5p1=5.1
    OPT_FLOAT__DEFAULT_16p1__OVERRIDED_26p1=26.1
    // OPT_FLOAT__BAD_DEFAULT__MISSING
  `);

  class EnvSchema {
    @env.float()
    FLOAT_9p1!: Float;
    
    @env.float()
    FLOAT__INT!: Float;

    @env.float()
    FLOAT__MISSING!: Float;

    @env.optional.float()
    OPT_FLOAT__8: Float | undefined;

    @env.optional.float()
    OPT_FLOAT__MISSING: Float | undefined;
    
    // min/max ok
    @env.optional.float({ min: 10, max: 20 })
    OPT_FLOAT__DEFAULT_5p1__OVERRIDED_15p1: Float = 5.1 as Float;

    // min/max ok
    @env.optional.float({ min: 10, max: 20 })
    OPT_FLOAT__DEFAULT_26p1__OVERRIDED_16p1: Float = 26.1 as Float;

    // min err
    @env.optional.float({ min: 10, max: 20 })
    OPT_FLOAT__DEFAULT_15p1__OVERRIDED_5p1: Float = 15.1 as Float;

    // max err
    @env.optional.float({ min: 10, max: 20 })
    OPT_FLOAT__DEFAULT_16p1__OVERRIDED_26p1: Float = 16.1 as Float;

    @env.optional.float({ min: 2 })
    OPT_FLOAT__BAD_DEFAULT__MISSING: Float = 1.1 as Float;
  }

  expectEnvError(
    EnvSchema, trimEachLine(`Invalid environment variables provided:
    - FLOAT__MISSING (Actual value=undefined): should be number (int and float accepted. Float separator is '.').
    - OPT_FLOAT__DEFAULT_15p1__OVERRIDED_5p1 (Actual value=5.1) is optional but if set then: must not be lower than 10.
    - OPT_FLOAT__DEFAULT_16p1__OVERRIDED_26p1 (Actual value=26.1) is optional but if set then: must not be greater than 20.
    - OPT_FLOAT__BAD_DEFAULT__MISSING (Actual value=1.1). It is optional but it defaults to invalid value=1.1 that should be changed by developer in ConfigSchema. For now you can just overwrite it by environment variable. Problem: must not be lower than 2.`)
  );
});

test('Key mappings success', () => {
  envFile(`
    NO_MAP=0.01
    A=1.1
    B=2.2
    OPT_B=22.22
  `);

  class EnvSchema {
    @env().float()
    NO_MAP!: Float;

    @env('B').float()
    A!: Float;

    @env('A').float()
    B!: Float;

    @env('NO_MAP').optional.float()
    OPT__NO_MAP?: Float;

    @env('OPT_B').optional.float()
    OPT_B?: Float;

    @env('OPT_B').optional.float()
    OPT_B__DEFAULT_3p34: Float = 3.34 as Float;

    @env('OPT_MISSING').optional.float()
    OPT__DEFAULT_3p3__MISSING: Float = 3.3 as Float;
  }

  const expected: EnvSchema = {
    NO_MAP: 0.01 as Float,
    A: 2.2 as Float,
    B: 1.1 as Float,
    OPT__NO_MAP: 0.01 as Float,
    OPT_B: 22.22 as Float,
    OPT_B__DEFAULT_3p34: 22.22 as Float,
    OPT__DEFAULT_3p3__MISSING: 3.3 as Float,
  };
  
  expectOk(EnvSchema, expected);
});

test('Key mappings error messgae', () => {
  envFile(`
  `);

  class EnvSchema {
    @env().float()
    NO_MAP!: Float;

    @env('B').float()
    A!: Float;
  }
  
  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - NO_MAP (Actual value=undefined): should be number (int and float accepted. Float separator is '.').
    - B mapped to config A (Actual value=undefined): should be number (int and float accepted. Float separator is '.').`
  ));
});
