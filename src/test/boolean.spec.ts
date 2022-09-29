import { env } from '../app';
import { envFile, trimEachLine, expectEnvError, expectOk } from './test.util';

test('Required success', () => {
  envFile(`
    BOOL_T=true
    BOOL_F=false
    BOOL_1=1
    BOOL_0=0
  `);

  class EnvSchema {
    @env().boolean()
    BOOL_T!: boolean;

    @env.boolean()
    BOOL_F!: boolean;

    @env.boolean()
    BOOL_1!: boolean;

    @env.boolean()
    BOOL_0!: boolean;
  }

  const expected: EnvSchema = {
    BOOL_T: true,
    BOOL_F: false,
    BOOL_1: true,
    BOOL_0: false,
  };
  
  expectOk(EnvSchema, expected);
});

test('Optional success', () => {
  envFile(`
    OPT_BOOL_T=true
    OPT_BOOL_F=false
    OPT_BOOL_1=1
    OPT_BOOL_0=0
    // OPT_BOOL_MISSING
    // OPT_BOOL_DEFAULT_TRUE__MISSING
    // OPT_BOOL_DEFAULT_FALSE__MISSING
    OPT_BOOL__DEFAULT_TRUE__OVERRIDED_FALSE=0
    OPT_BOOL__DEFAULT_FALSE__OVERRIDED_TRUE=true
  `);

  class EnvSchema {
    @env.optional.boolean()
    OPT_BOOL_T: boolean | undefined;

    @env.optional.boolean()
    OPT_BOOL_F: boolean | undefined;

    @env.optional.boolean()
    OPT_BOOL_1: boolean | undefined;

    @env.optional.boolean()
    OPT_BOOL_0: boolean | undefined;

    @env.optional.boolean()
    OPT_BOOL_MISSING: boolean | undefined;

    @env.optional.boolean()
    OPT_BOOL_DEFAULT_TRUE__MISSING: boolean = true;

    @env.optional.boolean()
    OPT_BOOL_DEFAULT_FALSE__MISSING = false;

    @env.optional.boolean()
    OPT_BOOL__DEFAULT_TRUE__OVERRIDED_FALSE = true;

    @env.optional.boolean()
    OPT_BOOL__DEFAULT_FALSE__OVERRIDED_TRUE = false;
  }

  const expected: EnvSchema = {
    OPT_BOOL_T: true,
    OPT_BOOL_F: false,
    OPT_BOOL_1: true,
    OPT_BOOL_0: false,
    OPT_BOOL_MISSING: undefined,
    OPT_BOOL_DEFAULT_TRUE__MISSING: true,
    OPT_BOOL_DEFAULT_FALSE__MISSING: false,
    OPT_BOOL__DEFAULT_TRUE__OVERRIDED_FALSE: false,
    OPT_BOOL__DEFAULT_FALSE__OVERRIDED_TRUE: true,
  };
  expected.OPT_BOOL_T

  expectOk(EnvSchema, expected);
});

test('Basic error', () => {
  envFile(`
    BOOL_OK=true
    // BOOL__MISSING
    // OPT_BOOL__MISSING
    OPT_BOOL__INVALID=haha
  `);

  class EnvSchema {
    @env.boolean()
    BOOL_OK!: boolean;

    @env.boolean()
    BOOL__MISSING!: boolean;

    @env.optional.boolean()
    OPT_BOOL__MISSING: boolean | undefined;
    
    @env.optional.boolean()
    OPT_BOOL__INVALID: boolean | undefined;
  }

  expectEnvError(
    EnvSchema, trimEachLine(`Invalid environment variables provided:
    - BOOL__MISSING (Actual value=undefined): must be one of accepted boolean values=[true, false, 1, 0].
    - OPT_BOOL__INVALID (Actual value="haha") is optional but if set then: must be one of accepted boolean values=[true, false, 1, 0].
    `)
  );
});

test('Key mappings success', () => {
  envFile(`
    NO_MAP=true
    A=true
    B=false
    OPT_B=false
  `);

  class EnvSchema {
    @env().boolean()
    NO_MAP!: boolean;

    @env('B').boolean()
    A!: boolean;

    @env('A').boolean()
    B!: boolean;

    @env('NO_MAP').optional.boolean()
    OPT_A?: boolean;

    @env('OPT_B').optional.boolean()
    OPT_B?: boolean;
  }

  const expected: EnvSchema = {
    NO_MAP: true,
    A: false,
    B: true,
    OPT_A: true,
    OPT_B: false,
  };
  
  expectOk(EnvSchema, expected);
});

test('Key mappings error messgae', () => {
  envFile(`
  `);

  class EnvSchema {
    @env().boolean()
    NO_MAP!: boolean;

    @env('B').boolean()
    A!: boolean;
  }
  
  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - NO_MAP (Actual value=undefined): must be one of accepted boolean values=[true, false, 1, 0].
    - B mapped to config.A (Actual value=undefined): must be one of accepted boolean values=[true, false, 1, 0].`
  ));
});
