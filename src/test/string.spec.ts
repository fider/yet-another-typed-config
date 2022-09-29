import { env } from '../app';
import { envFile, trimEachLine, expectEnvError, expectOk } from './test.util';

test('Required success', () => {
  envFile(`
    STR_A=yo men
    STR_B="I am quoted to avoid extra space trim  "
  `);

  class EnvSchema {
    @env.string()
    STR_A!: string;

    @env.string()
    STR_B!: string;
  }

  const expected: EnvSchema = {
    STR_A: 'yo men',
    STR_B: 'I am quoted to avoid extra space trim  '
  };
  
  expectOk(EnvSchema, expected);
});


test('Optional success', () => {
  envFile(`
    OPT_STR=I am set
    // OPT_STR__MISSING
    OPT_STR__DEFAULT_Aa__OVERRIDED_Bb=Bb
    // OPT_STR__DEFAULT_X__MISSING
  `);

  class EnvSchema {
    @env.optional.string()
    OPT_STR: string | undefined;

    @env.optional.string()
    OPT_STR__MISSING: string | undefined;

    @env.optional.string()
    OPT_STR__DEFAULT_Aa__OVERRIDED_Bb: string = 'Aa';

    @env.optional.string()
    OPT_STR__DEFAULT_X__MISSING: string = 'X';
  }

  const expected: EnvSchema = {
    OPT_STR: 'I am set',
    OPT_STR__MISSING: undefined,
    OPT_STR__DEFAULT_Aa__OVERRIDED_Bb: 'Bb',
    OPT_STR__DEFAULT_X__MISSING: 'X',
  };

  expectOk(EnvSchema, expected);
});

test('Errors & invalid default value', () => {
  envFile(`
    STR__OK_A=ok a
    // STR__MISSING
    OPT_STR__OK_B=ok b
    // OPT_STR__MISSING
    STR__MATCH_OK__OK=ok
    STR__MATCH_OK__NOT_OK=not ok
    OPT_STR__MATCH_OK__NOT_OK=not ok
    // OPT_STR__MATCH_OK__MISSING
    OPT_STR__MATCH_OK__DEFAULT_NOT_OK__OK=ok
    // OPT_STR__MATCH_OK__DEFAULT_NOT_OK__MISSING
    OPT_STR__MATCH_OK__DEFAULT_OK__NOT_OK=not ok
    // OPT_STR__MATCH_OK__DEFAULT_OK__MISSING
  `);

  const matchOkKo = /^(ok|ko)$/;

  class EnvSchema {
    @env.string()
    STR__OK_A!: string;

    @env.string()
    STR__MISSING!: string;
    
    @env.optional.string()
    OPT_STR__OK_B: string | undefined;
    
    @env.optional.string()
    OPT_STR__MISSING: string | undefined;
    //
    // match
    //
    @env.string({ match: matchOkKo })
    STR__MATCH_OK__OK!: string;

    @env.string({ match: matchOkKo })
    STR__MATCH_OK__NOT_OK!: string;

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__NOT_OK!: string;

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__MISSING!: string;

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__DEFAULT_NOT_OK__OK: string = 'NOT ok';

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__DEFAULT_NOT_OK__MISSING: string = 'NOT ok';

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__DEFAULT_OK__NOT_OK: string = 'ok';

    @env.optional.string({ match: matchOkKo })
    OPT_STR__MATCH_OK__DEFAULT_OK__MISSING: string = 'ok';
  }

  expectEnvError(
    EnvSchema, trimEachLine(`Invalid environment variables provided:
    - STR__MISSING (Actual value=undefined): must be string AND must be non-empty string.
    - STR__MATCH_OK__NOT_OK (Actual value=\"not ok\"): must match /^(ok|ko)$/ regular expression.
    - OPT_STR__MATCH_OK__NOT_OK (Actual value=\"not ok\") is optional but if set then: must match /^(ok|ko)$/ regular expression.
    - OPT_STR__MATCH_OK__DEFAULT_NOT_OK__MISSING (Actual value=\"NOT ok\"). It is optional but it defaults to invalid value=\"NOT ok\" that should be changed by developer in ConfigSchema. For now you can just overwrite it by environment variable. Problem: must match /^(ok|ko)$/ regular expression.
    - OPT_STR__MATCH_OK__DEFAULT_OK__NOT_OK (Actual value=\"not ok\") is optional but if set then: must match /^(ok|ko)$/ regular expression.`)
  )
});

test('Key mappings success', () => {
  envFile(`
    NO_MAP=ok
    A=value-a
    B=value-b
    OPT_C=value-c
  `);

  class EnvSchema {
    @env().string()
    NO_MAP!: string;

    @env('B').string()
    A!: string;

    @env('A').string()
    B!: string;

    @env('NO_MAP').optional.string()
    OPT__NO_MAP?: string;

    @env('OPT_C').optional.string()
    OPT_C?: string;

    @env('OPT_C').optional.string()
    OPT_C__DEFAULT_D: string = 'd';

    @env('OPT_MISSING').optional.string()
    OPT__DEFAULT_E__MISSING: string = 'e';
  }

  const expected: EnvSchema = {
    NO_MAP: 'ok',
    A: 'value-b',
    B: 'value-a',
    OPT__NO_MAP: 'ok',
    OPT_C: 'value-c',
    OPT_C__DEFAULT_D: 'value-c',
    OPT__DEFAULT_E__MISSING: 'e',
  };
  
  expectOk(EnvSchema, expected);
});

test('Key mappings error messgae', () => {
  envFile(`
  `);

  class EnvSchema {
    @env().string()
    NO_MAP!: string;

    @env('B').string()
    A!: string;
  }
  
  expectEnvError(EnvSchema, trimEachLine(`Invalid environment variables provided:
    - NO_MAP (Actual value=undefined): must be string AND must be non-empty string.
    - B mapped to config.A (Actual value=undefined): must be string AND must be non-empty string.`
  ));
});
